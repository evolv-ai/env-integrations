import { createFilter } from '@rollup/pluginutils';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

function replaceNewlines(data) {
  return data.replace(/\r|\r?\n/gm, ' ')
}

function replaceMultipleSpaces(data) {
  return data.replace(/\s{2,}/gm, ' ');
}

function removeLeadingSpaces(data, index) {
  if (index === 0) {
    return data.replace(/^ +/, '')
  }

  return data
}

function removeTrailingSpaces(data, index, length) {
  if (index === length - 1) {
    data = data.replace(/ +$/, '')
  }

  return data;
}

function minifyTaggedTemplate(options = {}) {
  const { include, exclude, tagNames } = options;
  const filter = createFilter(include, exclude);

  const transformers = {
    css: (data, index, length) => {
      let transformed = data;

      // Replace all newlines with spaces
      transformed = replaceNewlines(transformed);

      // Remove spaces before and after these characters
      transformed = transformed.replace(/[\s]*([{}>~=^$:!;])[\s]*/gm, '$1');

      // Remove spaces only after these characters
      transformed = transformed.replace(/([",])\s+/gm, '$1');

      // You only need one consequetive space in CSS
      transformed = replaceMultipleSpaces(transformed);

      // Remove leading spaces only for beginning of template
      transformed = removeLeadingSpaces(transformed, index);

      // Remove trailing spaces only for end of template
      transformed = removeTrailingSpaces(transformed, index, length);

      return transformed;
    },
    html: (data, index, length) => {
      let transformed = data;

      // Replace all newlines with spaces
      transformed = replaceNewlines(transformed);

      // Remove spaces before tag openings
      transformed = transformed.replace(/ *</gm, '<');

      // Remove spaces before tag closings
      transformed = transformed.replace(/> */gm, '>');

      // You only need one consequitive space in HTML
      transformed = replaceMultipleSpaces(transformed);

      // Remove leading spaces only for beginning of template
      transformed = removeLeadingSpaces(transformed, index);

      // Remove trailing spaces only for end of template
      transformed = removeTrailingSpaces(transformed, index, length);

      return transformed;
    },
    mixin: (data, index, length) => {
      return transformers['css'](data, index, length);
    }
  }

  return {
    name: 'transform-tagged-template', // Name of the plugin

    transform(code, id) {
      if (!filter(id) || !tagNames.length) {
        return null
      } // Skip files not matching include/exclude

      // Parse the code into an AST
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['jsx'], // Add other plugins if necessary
      });

      traverse(ast, {
        TaggedTemplateExpression(path) {
          // Check if the tag matches the specified tagName
          const nodeQuasi = path.node.quasi;

          tagNames.forEach(tagName => {
            if (!(tagName === path.node.tag.name && Object.keys(transformers).includes(tagName))) {
              return;
            }
            

            nodeQuasi.quasis.forEach((quasi, index, array) => {
              const { length } = array;
              const quasiTransformed = transformers[tagName](quasi.value.raw, index, length);
              quasi.value.raw = quasiTransformed;
              quasi.value.cooked = quasiTransformed;
            })
          });

          path.replaceWith(nodeQuasi);
        }
      });

      // Generate transformed code
      return generate(ast);
    },
  };
}

export default minifyTaggedTemplate;
