const mpatch = require('../index');

it('lets you access internal unexposed variables', () => {
    const module = mpatch('../test-file');

    expect(module.__get__('internalFunction')()).toEqual('internalFunction');
});
