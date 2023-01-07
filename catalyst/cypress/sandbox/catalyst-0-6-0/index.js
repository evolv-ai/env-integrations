setTimeout(() => {
    const rule = window.evolv.catalyst['test-0-6-0'];
    const store = rule.store;
    const $ = rule.select;
    const $$ = rule.selectAll;
    const $i = rule.selectInstrument;
    const { log, instrument } = rule;

    instrument.add([
        ['body', () => $('body'), { type: 'single' }],
        ['navItem', () => $$('.nav-item')],
        ['productNavItemLink', () => $$('.nav-item a[href="product.html"]')],
        ['learnButton', () => $('#learn'), { type: 'single' }],
        ['jumbotron', () => $('.jumbotron'), { type: 'single' }],
        ['when-methods', () => $('.when-methods'), { type: 'single' }],
    ]);

    // select, selectAll, selectInstrument
    $('h2').addClass('evolv-select-first-h2');
    $$('//p').addClass('evolv-select-all-p');
    $i('learnButton').addClass('evolv-select-single-instrument');
    $i('navItem').addClass('evolv-select-all-instrument');

    // rule.track
    rule.track('c1v1');

    // WHEN functions
    // Here we can only test the active state because there is no live Evolv snippet and SPA routing setup
    rule.whenContext('active').then(() => {
        $('.when-methods .row').append(
            `<div class="when-context col-md-4">
                    <h3>whenContext</h3>
                    <p>The current context is '${rule._evolvContext.state.current}'</p>
                </div>
            </div>`
        );
    });

    rule.whenMutate().then(() => {
        $('.when-methods .row').markOnce('when-mutate')
            .append(`<div class="when-mutate col-md-4">
                        <h3>whenMutate</h3>
                        <p>A mutation occurred
                    </p>
                </div>`);
    });

    rule.whenItem('when-methods').then((whenMethods) => {
        whenMethods.find('.row').append(`<div class="when-item col-md-4">
                <h3>whenItem</h3>
                <p>Element instrumented
            </p>
        </div>`);
    });

    rule.whenDOM('.when-methods.delayed-class .row').then((row) =>
        row.append(`<div class="when-dom col-md-4">
            <h3>whenDOM</h3>
            <p>The delayed class has now appeared
        </p>
        </div>`)
    );

    setTimeout(() => $('.evolv-when-methods').addClass('delayed-class'), 250);

    rule.whenElement('.when-methods.delayed-class .row').then((row) =>
        row.insertAdjacentHTML(
            'beforeend',
            `<div class="when-element col-md-4">
            <h3>whenElement</h3>
            <p>The delayed class has now appeared
        </p>
        </div>`
        )
    );

    let whenMethodsCount = 0;

    rule.whenElements('.when-methods.delayed-class .row > div').then((div) => {
        whenMethodsCount++;

        $('.when-methods .row').markOnce('when-elements')
            .append(`<div class="when-elements col-md-4">
                <h3>whenElements</h3>
                <p><span class="when-methods-count">${whenMethodsCount}</span> when methods found
                </p>
            </div>`);

        $('.when-methods-count').text(whenMethodsCount);
    });

    // store.instrumentDOM({
    //     bottomContainerSection: {
    //         get dom() {
    //             return $('.container .row .col-md-4');
    //         },
    //     },
    //     bottomContainerSectionH2: {
    //         get dom() {
    //             return $('.evolv-bottomContainerSection h2');
    //         },
    //     },
    //     bottomContainerSectionH2_first: {
    //         get dom() {
    //             return $('.evolv-bottomContainerSection:nth-of-type(1) h2');
    //         },
    //     },
    //     bottomContainerSectionH2_second: {
    //         get dom() {
    //             return $('.evolv-bottomContainerSection:nth-of-type(2) h2');
    //         },
    //     },
    //     bottomContainerSectionH2_third: {
    //         get dom() {
    //             return $('.evolv-bottomContainerSection:nth-of-type(3) h2');
    //         },
    //     },
    //     bottomContainerSection_filtered: {
    //         get dom() {
    //             return $('.row h2').filter(
    //                 ':not(.evolv-bottomContainerSectionH2_third)'
    //             );
    //         },
    //     },
    //     jumbotronH1: {
    //         get dom() {
    //             return $('.jumbotron h1');
    //         },
    //     },
    //     jumbotronH1Parent: {
    //         get dom() {
    //             return $('.evolv-jumbotronH1').parent();
    //         },
    //     },
    //     containsCheckout: {
    //         get dom() {
    //             return $('button').contains('Checkout');
    //         },
    //     },
    //     findSecondDetailsButton: {
    //         get dom() {
    //             return $('.row').find('.col-md-4:nth-child(2) .btn');
    //         },
    //     },
    //     closestRow: {
    //         get dom() {
    //             return $('.col-md-4').closest('.row');
    //         },
    //     },
    //     numberEight: {
    //         get dom() {
    //             return $('.number-gallery-item:nth-child(8)');
    //         },
    //     },
    //     rowChildren: {
    //         get dom() {
    //             return $('.row').children();
    //         },
    //     },
    //     rowChildrenNotFirst: {
    //         get dom() {
    //             return $('.row').children(':not(:first-child)');
    //         },
    //     },
    //     nextSection: {
    //         get dom() {
    //             return $('.col-md-4:first-child').next();
    //         },
    //     },
    //     prevSection: {
    //         get dom() {
    //             return $('.col-md-4:nth-child(2)').prev();
    //         },
    //     },
    //     tabPanelHeading: {
    //         get dom() {
    //             return $('.tab-panels h3');
    //         },
    //     },
    // });

    // // Manipulate Class
    // rule.whenItem('jumbotronH1').then((ENode) => {
    //     ENode.addClass('evolv-mainHeading');
    // });

    $('.copyright').removeClass('copyright');

    // Repositioning and insertion
    $('footer').append(
        $(
            "<p class='footer-append'>Testing by Charles Robertson [ .append() ]</p>"
        )
    );
    $('footer').prepend(
        $("<p class='footer-prepend'>Additional info: [ .prepend() ]</p>")
    );
    // // insertBefore/insertAfter kill the footer
    $(
        "<p class='content-end'>End of content. [ .insertBefore() ]</p>"
    ).insertBefore($('footer'));
    $(
        "<div class='sub-footer bg-dark' style='color: white'><p>What goes below the footer? [ .insertAfter() ]</p></div>"
    ).insertAfter($('footer'));
    $('.number-gallery').beforeMe(
        "<h2 class='number-gallery-title'>Number Gallery: </div>"
    );
    $('.number-gallery').afterMe(
        "<section class='section-nonexistant'><hr><h2>New Section</h2><p>This section probably shouldn't exist, but it does, thanks to the <code>.afterMe()</code> method and you're going to have to deal with that.</p></section>"
    );

    // wrap/wrapAll is not a function
    $('.number-gallery').wrap("<div class='number-gallery-wrap'></div>");

    $('.number-gallery-item').wrapAll(
        "<div class='number-gallery-inner' style='display: grid; width: 100%; gap: .5em'></div>"
    );
    $('.number-gallery-item:nth-child(2n)').markOnce('marked');
    $('body').on('click', (event) => {
        console.log('evolv: click');
        event.target.setAttribute('evolv-click', true);
    });

    $('.html-test-string').html(
        "<h2 class='html-test-string-heading'>New Section</h2><p>This section was added by the ENode.prototype.html() method by passing a string. Its markup is below.</p><hr />"
    );

    document
        .querySelector('.number-gallery-markup')
        .append($('.number-gallery').html());

    $('.number-gallery-item:nth-child(6)').text('six');
    document.querySelector('.text-output').textContent =
        $('.jumbotron p').text();

    document.querySelector('.attr-output').textContent =
        $('.number-gallery').attr('evolv-attr');
    $('.number-gallery').attr({ 'evolv-count': '6' });

    // Constructs

    $('.number-gallery-item').each((item) => {
        item.text(item.firstDom().textContent + '*');
    });

    // Watch
    $('.number-gallery')
        .watch()
        .then((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    node.style.backgroundColor = 'rgb(78 132 138)';
                });
            });
        });

    setTimeout(() => {
        let seven = document.createElement('div');
        seven.classList.add('number-gallery-item');
        seven.textContent = '7';
        document.querySelector('.number-gallery-item:last-child').after(seven);
    }, 100);

    $('.number-gallery-item').firstDom().style.backgroundColor =
        'rgb(183 63 63)';
    $('.number-gallery-item').lastDom().style.backgroundColor =
        'rgb(183 63 63)';
    $('.number-gallery-item').first().el[0].style.fontWeight = 'bold';
    $('.number-gallery-item').last().el[0].style.fontWeight = 'bold';

    // Reactivate
    // setTimeout(() => {
    //   const evolvInstruments = document.querySelectorAll('[class*="evolv-"]');
    //   evolvInstruments.forEach((element) => {
    //     element.classList.forEach((classItem) => {
    //       if (classItem.indexOf("evolv-") === 0) {
    //         element.classList.remove(classItem);
    //       }
    //     });
    //   });
    // }, 1000);

    // setTimeout(() => {
    //   rule.reactivate();
    // }, 1500);

    rule.whenDOM('.tab-panels').reactivateOnChange();

    // Reactivate on change
    const tabSection = document.querySelector('.tabs');
    const tabs = tabSection.querySelectorAll('.tab');
    const tabPanels = [];
    const tabPanelSection = tabSection.querySelector('.tab-panels');
    tabPanels[0] = tabSection.querySelector('.tab-panel-1').cloneNode(true);
    tabPanels[1] = tabSection.querySelector('.tab-panel-2').cloneNode(true);
    tabs[0].setAttribute('aria-expanded', 'true');
    tabs[1].setAttribute('aria-expanded', 'false');
    [0, 1].forEach((index) => {
        const panelHeading = tabPanels[index].querySelector('h3');
        panelHeading.removeAttribute('class');
    });
    tabPanelSection.children[1].remove();

    function selectTab() {
        const tabIndex = parseInt(this.dataset.tabIndex);
        if (tabs[tabIndex].getAttribute('aria-expanded') === 'false') {
            for (let i = 0; i < tabs.length; i++) {
                if (i === tabIndex) {
                    tabs[i].setAttribute('aria-expanded', 'true');
                    tabPanelSection.innerHTML = null;
                    tabPanelSection.append(tabPanels[i]);
                } else {
                    tabs[i].setAttribute('aria-expanded', 'false');
                }
            }
        }
    }

    tabs.forEach((tab) => {
        tab.addEventListener('click', selectTab);
    });
}, 0);
