import test from 'japa'

test.group('Example', () => {
  test('should sum', (assert) => {
    assert.equal(2 + 2, 4)
  })
})
