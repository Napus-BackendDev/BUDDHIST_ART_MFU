const ignoredModules = ['@coreui/icons', '@coreui/utils', 'axios'].join('|')

module.exports = {
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    'vue'
  ],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.jsx?$': '<rootDir>/node_modules/babel-jest'
  },
  transformIgnorePatterns: [`<rootDir>/node_modules/(?!${ignoredModules})`],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  snapshotSerializers: [
    'jest-serializer-vue'
  ],
  testMatch: ['<rootDir>/tests/unit/**/*.spec.js'],
  // CoreUI Pro template demo specs reference example components that were removed from
  // this project, so they fail to resolve and break the run. Skip them until the real
  // frontend suite (M4) replaces them. (Delete these spec files to drop them for good.)
  testPathIgnorePatterns: [
    '/node_modules/',
    'tests[\\\\/]unit[\\\\/]views[\\\\/](apps|base|buttons|charts|forms|icons|notifications|pages|plugins|tables|theme|users|widgets)[\\\\/]',
    'tests[\\\\/]unit[\\\\/]views[\\\\/]Dashboard\\.spec\\.js',
    'tests[\\\\/]unit[\\\\/]containers[\\\\/](TheContainer|TheFooter|TheHeader|TheHeaderDropdownAccnt|TheSidebar)\\.spec\\.js'
  ],
  verbose: true,
  testURL: "http://localhost/",
  collectCoverage: true,
  collectCoverageFrom: [
      "src/**/*.{js,vue}",
      "!**/node_modules/**"
  ],
  coverageReporters: ["html", "text-summary"]
}
