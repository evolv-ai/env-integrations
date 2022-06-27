describe('My First Test', () => {

    before(function () {
        cy.visit('https://lb8n9.csb.app/');
        cy.get('script[src="https://media.evolv.ai/asset-manager/releases/latest/webloader.js"]').should('exist');
        cy.wait(2000);
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

    it('Confirm "whenDOM" works', () => {
        cy.get('body.evolv-body.whenDOM_tagged').should('exist');
        cy.get('.evolv-learnButton').contains('Learn things');
    });

    it('Confirm "whenItem" works', () => {
        cy.get('.evolv-bottomContainerSection.whenItem_tagged').should('exist');
        cy.get('.evolv-bottomContainerSectionH2.whenItem_tagged').should('have.length', 3);
        
        cy.get('.evolv-bottomContainerSectionH2_first').should('exist');
        cy.get('.evolv-bottomContainerSectionH2_second').should('exist');
        cy.get('.evolv-bottomContainerSectionH2_third').should('exist');


        cy.get('.evolv-bottomContainerSectionH2_first').contains('Headline 1');
        cy.get('.evolv-bottomContainerSectionH2_second').contains('Headline 2');
        cy.get('.evolv-bottomContainerSectionH2_third').contains('Headline 3');
    });

    it('Confirm .parent() works', () => {
        cy.get(".evolv-jumbotronH1Parent").should("exist");
    });

    // it('Confirm "reactivateOnChange" works', () => {
        
    // });

    // it('Confirm "rule.reactive" works', () => {
        
    // });

    // it('Confirm "store.reactive" works', () => {
        
    // });

    

    /////////////////
    // NAVIGATION
    ////////////////
    
    // it('Confirm DOM is instrumented when navigating to new pages', () => {
    
    // });

    // it('Confirm DOM is instrumented when using browser "Back" button', () => {
        
    // });

    // it('Confirm DOM is instrumented when using browser "Forward" button', () => {
        
    // });


  
    ///////////////////
    // Helper functions
    ///////////////////

    it('Confirm ".filter()" works', () => {
        cy.get('.evolv-bottomContainerSection_filtered').should('exist');
        cy.get('.evolv-bottomContainerSection_filtered').should('have.length', 2);
    });

    // it('Confirm ".contains()" works', () => {
        
    // });
    
    // it('Confirm ".find()" works', () => {
        
    // });

    // it('Confirm ".closest()" works', () => {
        
    // });

    
    
    // it('Confirm ".children()" works', () => {
        
    // });


    // it('Confirm ".next()" works', () => {
        
    // });

    // it('Confirm ".prev()" works', () => {
        
    // });

    // it('Confirm ".addClass()" works', () => {
        
    // });

    // it('Confirm ".removeClass()" works', () => {
        
    // });

    // it('Confirm ".append()" works', () => {
        
    // });

    // it('Confirm ".prepend()" works', () => {
        
    // });

    // it('Confirm ".beforeMe()" works', () => {
        
    // });

    // it('Confirm ".afterMe()" works', () => {
        
    // });


    // it('Confirm ".insertBefore()" works', () => {
        
    // });

    
    // it('Confirm ".insertAfter()" works', () => {
        
    // });

    
    // it('Confirm ".wrap()" works', () => {
        
    // });

    
    // it('Confirm ".wrapAll()" works', () => {
        
    // });

    
    // it('Confirm ".markOnce()" works', () => {
        
    // });
    
    // it('Confirm ".on()" works', () => {
        
    // });
    
    // it('Confirm ".html()" works', () => {
        
    // });
    
    // it('Confirm ".text()" works', () => {
        
    // });
    
    // it('Confirm ".attr()" works', () => {
        
    // });
    
    // it('Confirm ".each()" works', () => {
        
    // });
    
    // it('Confirm ".watch()" works', () => {
        
    // });
    
    // it('Confirm ".firstDom()" works', () => {
        
    // });

    // it('Confirm ".lastDom()" works', () => {
        
    // });

    // it('Confirm ".first()" works', () => {
        
    // });

    // it('Confirm ".last()" works', () => {
        
    // });

    // it('Confirm "validator.lengthGreatherThan" works', () => {
        
    // });

    
    // it('Confirm "validator.contains" works', () => {
        
    // });

    
    // it('Confirm "validator.notContains" works', () => {
        
    // });

    
});