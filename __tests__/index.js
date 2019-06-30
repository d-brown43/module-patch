const mpatch = require('../index');

describe('accessing internal variables', () => {
    it('lets you access internal unexposed const variables', () => {
        const module = mpatch('../test-file');
        expect(module.__get__('internalFunction')()).toEqual('internalFunction');
    });

    it('lets you access internal unexposed let variables', () => {
        const module = mpatch('../test-file');
        expect(module.__get__('internalLetFunction')()).toEqual('internalLetFunction');
    });

    it('lets you access internal unexpected functions', () => {
        const module = mpatch('../test-file');
        expect(module.__get__('otherInternalFunction')()).toEqual('otherInternalFunction');
    });
});
