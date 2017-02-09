import { moduleFor, test } from 'ember-qunit';

moduleFor('service:teststatus', 'Build A User Profile Component', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});

// Replace this with your real tests.
test('Critical info is present', function(assert) {
  let service = this.subject();
  let done = assert.async();
  setTimeout(function() {
    done();
  }, 1000);
  assert.ok(service, 'Service is not falsy');
  assert.equal(3, 3, 'Three is three');
  assert.ok(true, 'Oops!!!!');
});

test('another thing', function(assert) {
  let service = this.subject();
  assert.ok(service, 'Service is not falsy');
  assert.equal(3, 3, 'Three is three');
  assert.ok(false, 'Something went wrong!');
});
