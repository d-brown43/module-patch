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

    it('lets you access variable from an assignment', () => {
        const module = mpatch('../test-file');
        expect(module.__get__('somethingElse')()).toEqual('internalFunction');
    });

    it('lets you accessed immediately invoked functions', () => {
        const module = mpatch('../test-file');
        expect(module.__get__('somethingWeird')()).toEqual('somethingWeird');
    });

    it('lets you access a variable declared initially in a lambda scope', () => {
        const module = mpatch('../test-file');
        expect(module.__get__('test')).toEqual('10');
    });
});

describe('setting internal variables', () => {
    it('lets you modify a basic variable', () => {
        const module = mpatch('../test-file');
        module.__set__('internalFunction', () => 'new value');
        expect(module.__get__('internalFunction')()).toEqual('new value');
    });
});
