import version from '../imports/version.js';
import utils from '../imports/utils.js';
import vds from '../imports/vds.js';
import Accordion from '../components/Accordion.js';
import AccordionDetails from '../components/AccordionDetails.js';
import AccordionHeader from '../components/AccordionHeader.js';
import AccordionItem from '../components/AccordionItem.js';
import Body from '../components/Body.js';
import Button from '../components/Button.js';
import ButtonIcon from '../components/ButtonIcon.js';
import Carousel from '../components/Carousel.js';
import Icon from '../components/Icon.js';
import Modal from '../components/Modal.js';
import ModalBody from '../components/ModalBody.js';
import ModalFooter from '../components/ModalFooter.js';
import ModalTitle from '../components/ModalTitle.js';
import TextLink from '../components/TextLink.js';
import TileContainer from '../components/TileContainer.js';
import Tooltip from '../components/Tooltip.js';
import TooltipContent from '../components/TooltipContent.js';
import Title from '../components/Title.js';

utils.debug(`init vds-components version ${version}`);

const components = {
  'evolv-accordion': Accordion,
  'evolv-accordion-details': AccordionDetails,
  'evolv-accordion-header': AccordionHeader,
  'evolv-accordion-item': AccordionItem,
  'evolv-body': Body,
  'evolv-button': Button,
  'evolv-button-icon': ButtonIcon,
  'evolv-carousel': Carousel,
  'evolv-icon': Icon,
  'evolv-modal': Modal,
  'evolv-modal-body': ModalBody,
  'evolv-modal-footer': ModalFooter,
  'evolv-modal-title': ModalTitle,
  'evolv-text-link': TextLink,
  'evolv-tile-container': TileContainer,
  'evolv-tooltip': Tooltip,
  'evolv-tooltip-content': TooltipContent,
  'evolv-title': Title,
};

Object.keys(components).forEach((name) => {
  if (!customElements.get(name)) {
    customElements.define(name, components[name]);
    vds[components[name].name] = components[name];
  }
});

const styleId = `evolv-vds-components`;
document.head.append(
  utils.makeElement(html`
    <style id="${styleId}">
      ${vds.style.document()}
    </style>
  `)
);

utils.observeWindowWidth();