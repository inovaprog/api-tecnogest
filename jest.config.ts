module.exports = {
    testEnvironment: 'node',
    testMatch: ['<rootDir>/test/**/*.spec.ts'],
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    globals: {
        'ts-jest': {
            isolatedModules: true
        }
    }
};