import { moduleFor, test } from 'ember-qunit';

moduleFor('service:teststatus', 'Unit | Service | teststatus', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  let service = this.subject();
  let done = assert.async();
  setTimeout(function() {
    done();
  }, 5000);
  assert.ok(service, 'Service is not falsy');
  assert.equal(3, 3, 'Three is three');
  assert.ok(false, 'Oops!!!!');
});


test('another thing', function(assert) {
  let service = this.subject();
  assert.ok(service, 'Service is not falsy');
  assert.equal(3, 3, 'Three is three');
});
