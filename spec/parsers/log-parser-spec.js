'use babel'

import '../spec-helpers'

import _ from 'lodash'
import path from 'path'
import LogParser from '../../lib/parsers/log-parser'

describe('LogParser', () => {
  let fixturesPath

  beforeEach(() => {
    fixturesPath = atom.project.getPaths()[0]
  })

  describe('parse', () => {
    it('returns the expected output path', () => {
      const expectedPath = path.resolve('/foo/output/file.pdf')
      const logFile = path.join(fixturesPath, 'file.log')
      const parser = new LogParser(logFile)
      const result = parser.parse()

      expect(result.outputFilePath).toBe(expectedPath)
    })

    it('returns the expected output path when the compiled file contained spaces', () => {
      const expectedPath = path.resolve('/foo/output/filename with spaces.pdf')
      const logFile = path.join(fixturesPath, 'filename with spaces.log')
      const parser = new LogParser(logFile)
      const result = parser.parse()

      expect(result.outputFilePath).toBe(expectedPath)
    })

    it('parses and returns all errors', () => {
      const logFile = path.join(fixturesPath, 'errors.log')
      const parser = new LogParser(logFile)
      const result = parser.parse()

      expect(_.countBy(result.messages, 'type').Error).toBe(3)
    })

    it('associates an error with a file path, line number, and message', () => {
      const logFile = path.join(fixturesPath, 'errors.log')
      const parser = new LogParser(logFile)
      const result = parser.parse()
      const error = _.find(result.messages, (message) => { return message.type === 'Error' })

      expect(error).toEqual({
        type: 'Error',
        logRange: [[196, 0], [196, 84]],
        filePath: 'errors.tex',
        range: [[9, 0], [9, 65536]],
        logPath: logFile,
        text: '\\begin{gather*} on input line 8 ended by \\end{gather}'
      })
    })
  })

  describe('getLines', () => {
    it('returns the expected number of lines', () => {
      const logFile = path.join(fixturesPath, 'file.log')
      const parser = new LogParser(logFile)
      const lines = parser.getLines()

      expect(lines.length).toBe(63)
    })

    it('throws an error when passed a filepath that does not exist', () => {
      const logFile = path.join(fixturesPath, 'nope.log')
      const parser = new LogParser(logFile)

      expect(parser.getLines).toThrow()
    })
  })
})
