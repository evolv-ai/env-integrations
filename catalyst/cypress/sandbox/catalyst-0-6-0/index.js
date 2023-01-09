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

    // New ENode methods
    // exists()
    const enodeExists = $('.enode-exists');
    if (enodeExists.exists())
        enodeExists.find('.enode-exists-output').text('Yes');

    // isConnected()
    const enodeIsConnected = $('.enode-is-connected');
    if (enodeIsConnected.isConnected())
        enodeIsConnected.find('.enode-is-connected-output').text('Yes');

    // hasClass()
    const enodeHasClass = $('.enode-has-class');
    if (enodeHasClass.hasClass('enode-has-class'))
        enodeHasClass.find('.enode-has-class-output').text('Yes');

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
