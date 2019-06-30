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
    it('lets you modify const variables', () => {
        const module = mpatch('../test-file');
        module.__set__('internalFunction', () => 'new value');
        expect(module.__get__('internalFunction')()).toEqual('new value');
    });

    it('lets you modify let variables', () => {
        const module = mpatch('../test-file');
        module.__set__('internalLetFunction', 10);
        expect(module.__get__('internalLetFunction')).toEqual(10);
    });

    it('lets you modify a function(?)', () => {
        // TODO is this allowed?
        const module = mpatch('../test-file');
        module.__set__('otherInternalFunction', () => 'yeah its allowed');
        expect(module.__get__('otherInternalFunction')()).toEqual('yeah its allowed');
    });

    it('lets you modify a function that is depended on', () => {
        const module = mpatch('../test-file');
        module.__set__('dependentFunction', () => 'i changed');
        expect(module.__get__('dependingFunction')()).toEqual('i changed dependingFunction');
    });
});
