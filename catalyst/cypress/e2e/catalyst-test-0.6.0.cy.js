describe('Catalyst 0.6.0+ E2E Test', () => {
    before(function () {
        cy.visit('http://localhost:3334/catalyst-0-6-0/');
    });

    after(function () {
        // runs once after the last test in this block
    });

    beforeEach(function () {
        // runs before each test in this block
    });

    afterEach(function () {
        // runs after each test in this block
    });

    it('Confirm homepage DOM is instrumented on initial page load', () => {
        cy.get('.evolv-body').should('exist');
        cy.get('.evolv-learnButton').should('exist');
        cy.get('.evolv-jumbotron').should('exist');
        cy.get('.evolv-navItem').should('exist');
        cy.get('.evolv-navItem').should('have.length', 7);
    });

    it('Confirm rule.select, rule.selectAll, rule.selectInstrument work', () => {
        cy.get('.evolv-select-first-h2')
            .should('exist')
            .should('have.length', 1);
        cy.get('.evolv-select-all-p')
            .should('exist')
            .should('have.length.gt', 13);
        cy.get('.evolv-select-single-instrument')
            .should('exist')
            .should('have.length', 1);
        cy.get('.evolv-select-all-instrument')
            .should('exist')
            .should('have.length', 7);
    });

    it('Confirm "whenContext" works', () => {
        cy.get('.when-context').should('exist').contains('active');
    });

    it('Confirm "whenMutate" works', () => {
        cy.get('.when-mutate').should('exist').contains('A mutation occurred');
    });

    it('Confirm "whenItem" works', () => {
        cy.get('.when-item').should('exist').contains('Element instrumented');
    });

    it('Confirm "whenDOM" works', () => {
        cy.get('.when-dom')
            .should('exist')
            .contains('The delayed class has now appeared');
    });

    it('Confirm "whenElement" works', () => {
        cy.get('.when-element')
            .should('exist')
            .contains('The delayed class has now appeared');
    });

    it('Confirm "whenElements" works', () => {
        let text, count;
        cy.get('.when-elements').should('exist').contains('when methods found');
        cy.get('.when-methods-count')
            .should('exist')
            .invoke('text')
            .then((text) => {
                const count = parseFloat(text);
                expect(count).to.be.greaterThan(5);
            });
    });

    //     ///////////////////
    //     // ENode methods
    //     ///////////////////

    it('Confirm ".exists()" works', () => {
        cy.get('.enode-exists-output').contains('Yes');
    });

    it('Confirm ".isConnected()" works', () => {
        cy.get('.enode-is-connected-output').contains('Yes');
    });

    it('Confirm ".hasClass()" works', () => {
        cy.get('.enode-has-class-output').contains('Yes');
    });
    //     it('Confirm ".filter()" works', () => {
    //         cy.get('.evolv-bottomContainerSection_filtered')
    //             .should('exist')
    //             .should('have.length', 2);
    //     });

    //     it('Confirm ".contains()" works', () => {
    //         cy.get('.evolv-containsCheckout').should('exist').contains('Checkout');
    //     });

    //     it('Confirm ".find()" works', () => {
    //         cy.get('.evolv-findSecondDetailsButton')
    //             .should('exist')
    //             .contains('View details');
    //     });

    //     it('Confirm ".closest()" works', () => {
    //         cy.get('.evolv-closestRow').should('exist').should('have.class', 'row');
    //     });

    //     it('Confirm ".children()" works', () => {
    //         cy.get('.evolv-rowChildrenNotFirst')
    //             .should('exist')
    //             .should('have.length', 2);
    //     });

    //     it('Confirm ".next()" works', () => {
    //         cy.get('.evolv-nextSection')
    //             .should('exist')
    //             .should('have.length', 1)
    //             .contains('Headline 2');
    //     });

    //     it('Confirm ".prev()" works when', () => {
    //         cy.get('.evolv-prevSection')
    //             .should('exist')
    //             .should('have.length', 1)
    //             .contains('Headline 1');
    //     });

    //     it('Confirm ".addClass()" works', () => {
    //         cy.get('h1').should('have.class', 'evolv-mainHeading');
    //     });

    //     it('Confirm ".removeClass()" works', () => {
    //         cy.get('footer > p')
    //             .should('exist')
    //             .should('not.have.class', 'copyright');
    //     });

    //     it('Confirm ".append()" works', () => {
    //         cy.get('.footer-append')
    //             .should('exist')
    //             .contains('Testing by Charles Robertson');
    //     });

    //     it('Confirm ".prepend()" works', () => {
    //         cy.get('.footer-prepend').should('exist').contains('Additional info:');
    //     });

    //     it('Confirm ".beforeMe()" works', () => {
    //         cy.get('.number-gallery-title')
    //             .should('exist')
    //             .contains('Number Gallery');
    //     });

    //     it('Confirm ".afterMe()" works', () => {
    //         cy.get('.section-nonexistant').should('exist').contains('but it does');
    //     });

    //     it('Confirm ".insertBefore()" works', () => {
    //         cy.get('.content-end').should('exist').contains('End');
    //     });

    //     it('Confirm ".insertAfter()" works', () => {
    //         cy.get('.sub-footer').should('exist').contains('below');
    //     });

    //     it('Confirm ".wrap()" works', () => {
    //         cy.get('.number-gallery-wrap')
    //             .should('exist')
    //             .children()
    //             .first()
    //             .should('have.class', 'number-gallery');
    //     });

    //     it('Confirm ".wrapAll()" works', () => {
    //         cy.get('.number-gallery-inner')
    //             .should('exist')
    //             .children()
    //             .first('have.class', 'number-gallery-item');
    //     });

    //     it('Confirm ".markOnce()" works', () => {
    //         cy.get('.number-gallery-item[marked="true"]')
    //             .should('exist')
    //             .should('have.length', 3);
    //     });

    //     it('Confirm ".on()" works', () => {
    //         cy.get('h1').click().should('have.attr', 'evolv-click');
    //     });

    //     it('Confirm ".html()" works when passed a string', () => {
    //         cy.get('.html-test-string-heading')
    //             .should('exist')
    //             .contains('New Section');
    //     });

    //     it('Confirm ".html()" works for outputting a string', () => {
    //         cy.get('.number-gallery-markup')
    //             .should('exist')
    //             .contains('<div class="number-gallery-item">1</div>');
    //     });

    //     it('Confirm ".text()" works when passed a string', () => {
    //         cy.get('.text-output').contains('This is a template');
    //     });

    //     it('Confirm ".text()" works for outputting a string', () => {
    //         cy.get('.number-gallery-item:nth-child(6)').contains('six');
    //     });

    //     it('Confirm ".attr()" works when getting an attribute', () => {
    //         cy.get('.attr-output').contains('test');
    //     });

    //     it('Confirm ".attr()" works for setting an attribute', () => {
    //         cy.get('.number-gallery').should('have.attr', 'evolv-count', '6');
    //     });

    //     it('Confirm ".each()" works', () => {
    //         cy.get('.number-gallery-item').first().contains('*');
    //     });

    //     it('Confirm ".watch()" works', () => {
    //         cy.get('.number-gallery-item:nth-child(7)')
    //             .should('exist')
    //             .should('have.css', 'background-color')
    //             .should('eq', 'rgb(78, 132, 138)');
    //     });

    //     it('Confirm ".firstDom()" works', () => {
    //         cy.get('.number-gallery-item:first-child')
    //             .should('have.css', 'background-color')
    //             .should('eq', 'rgb(183, 63, 63)');
    //     });

    //     it('Confirm ".lastDom()" works', () => {
    //         cy.get('.number-gallery-item:nth-child(6)')
    //             .should('have.css', 'background-color')
    //             .should('eq', 'rgb(183, 63, 63)');
    //     });

    //     it('Confirm ".first()" works', () => {
    //         cy.get('.number-gallery-item:first-child')
    //             .should('have.css', 'font-weight')
    //             .should('eq', '700');
    //     });

    //     it('Confirm ".last()" works', () => {
    //         cy.get('.number-gallery-item:nth-child(6)')
    //             .should('have.css', 'font-weight')
    //             .should('eq', '700');
    //     });

    //     it('Confirm "rule.reactivate" works', () => {
    //         cy.get('[class*="evolv-"]').should('have.length', 23);
    //         cy.window()
    //             .then((window) => {
    //                 const instrumented =
    //                     window.document.querySelectorAll('[class*="evolv-"]');
    //                 instrumented.forEach((element) => {
    //                     const classes = Array.from(element.classList).filter(
    //                         (a) => a.indexOf('evolv-') === 0
    //                     );
    //                     element.classList.remove(...classes);
    //                 });
    //             })
    //             .then((a) => {
    //                 cy.get('[class*="evolv-"]').should('have.length', 0);
    //             });

    //         cy.window().then((window) => {
    //             window.evolv.renderRule.catalystTest.reactivate();
    //         });

    //         cy.get('[class*="evolv-"]').should('have.length', 23);
    //     });

    //     it('Confirm "rule.reactivateOnChange" works', () => {
    //         cy.get('.tab-header .tab-2').click();
    //         cy.get('.tab-panel-2 h3').should('have.class', 'evolv-tabPanelHeading');
    //         cy.get('.tab-header .tab-1').click();
    //         cy.get('.tab-panel-1 h3').should('have.class', 'evolv-tabPanelHeading');
    //     });
});
