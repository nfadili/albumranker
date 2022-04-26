import faker from '@faker-js/faker';

describe('smoke tests', () => {
    afterEach(() => {
        cy.cleanupUser();
    });

    it('should allow you to register and login', () => {
        // TODO
    });
});
