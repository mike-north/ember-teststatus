/* eslint no-var:0, object-shorthand:0, prefer-template:0, max-statements-per-line:["error",{"max": 2}] */
/* globals define:true */
(function(w) {
  function handleEvent(event) {
    var evt = new Event('qunit-event');
    var frameId = event.data.instanceId;
    evt.data = event.data;
    delete evt.data.instanceId;
    var frame = document.querySelector('iframe.qunit-events-frame-' + frameId);
    frame.dispatchEvent(evt);
  }

  function receiveMessage(event) {
    var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
    if (origin !== 'http://localhost:4200') {
      return;
    }
    if (event.data.instanceId) {
      handleEvent(event);
    }
  }

  function doSetup() {
    w.addEventListener('message', receiveMessage, false);
  }
  w.addEventListener('load', doSetup);

  function defaultTestUrl() {
    var url = new URL(w.location.href);
    url.pathname = '/tests';
    return url.href;
  }

  // ==== UI ==== //
  function UI(client) {
    this.client = client;
  }

  UI.prototype = {
    setup: function() {
      // sidebar
      var sidebar = document.createElement('div');
      sidebar.className = 'qunit-events-sidebar ' + this.client._id;
      this.containerElement.appendChild(sidebar);

      // sidebar header
      var sidebarHeader = document.createElement('div');
      sidebarHeader.className = 'qunit-events-sidebar-header';
      sidebar.appendChild(sidebarHeader);
      sidebarHeader.innerHTML = '<h3>Tests</h3>';

      // test result container
      var sidebarContainer = document.createElement('div');
      sidebarContainer.className = 'qunit-events-sidebar-container';
      sidebar.appendChild(sidebarContainer);

      // test result container content
      var sidebarContent = document.createElement('div');
      sidebarContent.className = 'qunit-events-sidebar-content';
      sidebarContainer.appendChild(sidebarContent);

      // module list
      var moduleList = document.createElement('ul');
      moduleList.className = 'qunit-events-test-modules';
      sidebarContent.appendChild(moduleList);

      this.sidebar = sidebar;
    },

    addOrUpdateTestAssertion: function(moduleInfo, testInfo, assertionInfo, selectors, parent) {
      var assertionSelector = selectors.test + ' .test-assertions .test-assertion-' + assertionInfo.id;
      var assertionElem = document.querySelector(assertionSelector);
      if (!assertionElem) {
        assertionElem = document.createElement('li');
        assertionElem.className = 'test-assertion test-assertion-' + assertionInfo.id;
        parent.appendChild(assertionElem);
      }
      if (assertionInfo.result) {
        assertionElem.classList.add('status-passing');
        assertionElem.innerText = assertionInfo.message;
      } else {
        assertionElem.classList.add('status-failing');
        assertionElem.innerHTML = '<code>' + assertionInfo.message.split('\n').join('\n  ') + '</code>';
      }
    },

    addOrUpdateModuleTest: function(moduleInfo, testInfo, selectors, parent) {
      var testSelector = selectors.module + ' .module-tests .module-test-' + testInfo.id;
      var testElem = document.querySelector(testSelector);
      if (!testElem) {
        testElem = document.createElement('li');
        testElem.className = 'module-test module-test-' + testInfo.id;
        testElem.innerHTML = '<h4 class="module-test-name">' + testInfo.name + '</h4><ul class="test-assertions"></ul>';
        parent.appendChild(testElem);
      }
      if (typeof testInfo.status.failed === 'number' && testInfo.status.failed > 0) {
        testElem.classList.add('status-failing');
        testElem.classList.remove('status-unknown');
        testElem.classList.remove('status-passing');
      } else if (typeof testInfo.status.failed === 'number' && testInfo.status.failed === 0) {
        testElem.classList.remove('status-failing');
        testElem.classList.remove('status-unknown');
        testElem.classList.add('status-passing');
      } else {
        testElem.classList.remove('status-failing');
        testElem.classList.add('status-unknown');
        testElem.classList.remove('status-passing');
      }
      if (typeof testInfo.assertions === 'object' && testInfo.assertions.length > 0) {
        testElem.classList.add('has-assertions');
        var assertionList = document.querySelector(testSelector + ' .test-assertions');
        for (var i = 0; i < testInfo.assertions.length; i++) {
          this.addOrUpdateTestAssertion(moduleInfo, testInfo, Object.assign({ id: i }, testInfo.assertions[i]), {
            module: selectors.module,
            test: testSelector
          }, assertionList);
        }
      } else {
        testElem.classList.add('no-assertions');
      }
    },

    addOrUpdateModule: function(moduleInfo, idx) {
      var listSelector = '.' + this.client._id + ' .qunit-events-sidebar-content ul.qunit-events-test-modules';
      var list = document.querySelector(listSelector);
      var itemSelector = listSelector + ' li.test-module-' + idx;
      var item = document.querySelector(itemSelector);
      if (!item) {
        item = document.createElement('li');
        item.className = 'test-module test-module-' + idx;
        item.innerHTML = '<h4 class="module-name">' + moduleInfo.name + '</h4><ul class="module-tests"></ul>';
        list.appendChild(item);
      }
      if (typeof moduleInfo.status.failed === 'number' && moduleInfo.status.failed > 0) {
        item.classList.add('status-failing');
        item.classList.remove('status-unknown');
        item.classList.remove('status-passing');
      } else if (typeof moduleInfo.status.failed === 'number' && moduleInfo.status.failed === 0) {
        item.classList.remove('status-failing');
        item.classList.remove('status-unknown');
        item.classList.add('status-passing');
      } else {
        item.classList.remove('status-failing');
        item.classList.add('status-unknown');
        item.classList.remove('status-passing');
      }
      if (typeof moduleInfo.tests === 'object' && moduleInfo.tests.length > 0) {
        item.classList.add('has-tests');
        for (var i = 0; i < moduleInfo.tests.length; i++) {
          this.addOrUpdateModuleTest(moduleInfo, moduleInfo.tests[i], {
            module: itemSelector
          }, document.querySelector(itemSelector + ' .module-tests'));
        }
      } else {
        item.classList.add('no-tests');
      }
    },
    setupTestFrame: function(container) {
      this.containerElement = container || w.document.body;
      var iframe = document.createElement('iframe');
      iframe.src = this.client._testUrl;
      iframe.onload = this.client._onFrameLoaded;
      iframe.style = 'position: absolute; left: -10000px';
      iframe.className = 'qunit-events-frame-' + this.client._id;
      iframe.addEventListener('qunit-event', this.client._handleEvent);
      this.containerElement.appendChild(iframe);
      this.setup();
    }
  };

  // ==== Client ==== //

  function QUnitEventsClient(options) {
    this._testUrl = (options || {}).testUrl || defaultTestUrl();
    this._id = 'qunitEvents' + Math.round(Math.random() * 100000000);
    this.ui = new UI(this);
    // ====== IFRAME LOAD RESPONDER ====== //

    function setupTestFrameWindow(fw) {
      var testOrigin = new URL(this._testUrl).origin;
      var appOrigin = new URL(w.location.href).origin;
      fw.postMessage({
        eventName: 'setup',
        instanceId: this._id,
        plugins: [{
          type: 'postmessage',
          origin: appOrigin
        }]
      }, testOrigin);
    }

    this._onFrameLoaded = function(event) {
      var testFrameWindow = event.target.contentWindow;
      setupTestFrameWindow.call(this, testFrameWindow);
    }.bind(this);

    // ====== STATE ====== //
    function qunitTestAdapter(testInfo) {
      return {
        name: testInfo.name,
        id: testInfo.testId,
        assertions: [],
        status: {},
        time: null
      };
    }

    function qunitModuleAdapter(moduleInfo) {
      return {
        name: moduleInfo.name,
        tests: moduleInfo.tests.map(qunitTestAdapter),
        status: {},
        time: null
      };
    }

    function qunitAssertionAdapter(assertionInfo) {
      return {
        result: assertionInfo.result,
        message: assertionInfo.message.split('\n').join('\n  ')
      };
    }
    this._setupModule = function(moduleInfo) {
      this._testModules.push(qunitModuleAdapter(moduleInfo));
    };

    // ===== Utilities ===== //
    this._moduleByName = function(name) {
      var items = this._testModules.filter(function(x) {
        return x.name === name;
      });
      return items.length > 0 ? items[0] : null;
    };

    this._testByName = function(moduleName, testName) {
      var m = this._moduleByName(moduleName);
      var items = m.tests.filter(function(x) {
        return x.name === testName;
      });
      return items.length > 0 ? items[0] : null;
    };

    // ====== MESSAGE EVENT RESPONDERS ====== //
    this._onBegin = function(msg) {
      var testModules = msg.modules;
      this._testModules = new Array();
      for (var i = 0; i < testModules.length; i++) {
        this._setupModule.call(this, testModules[i]);
      }
      this._doUIUpdate();
    };

    this._onModuleStart = function(/* msg */) {
      this._doUIUpdate();
    };

    this._onTestStart = function(/* msg */) {
      this._doUIUpdate();
    };

    this._onTestDone = function(msg) {
      var t = this._testByName(msg.module, msg.name);
      if (msg.testId !== t.id) {
        throw 'Expected ' + t.id + ' to finish before other tests start';
      }
      t.assertions = msg.assertions.map(qunitAssertionAdapter);
      t.time = msg.runtime;
      t.status = {
        passed: msg.passed,
        failed: msg.failed
      };
      this._doUIUpdate();
    };

    this._onModuleDone = function(msg) {
      var m = this._moduleByName(msg.name);
      m.time = msg.runtime;
      m.status = {
        passed: msg.passed,
        failed: msg.failed
      };
      this._doUIUpdate();
    };

    this._onDone = function() {
      this._doUIUpdate();
    };
    // ==== UI Updating ==== //
    this._uiUpdateTask = null;
    this._doUIUpdate = function() {
      if (this._uiUpdateTask) {
        clearTimeout(this._uiUpdateTask);
        this._uiUpdateTask = null;
      }
      this._uiUpdateTask = setTimeout(function() {
        this.updateUI();
      }.bind(this), 100);
    };

    this._handleEvent = function(event) {
      switch (event.data.eventName) {
        case 'begin':       this._onBegin.call(this, event.data); break;
        case 'moduleStart': this._onModuleStart.call(this, event.data); break;
        case 'moduleDone':  this._onModuleDone.call(this, event.data); break;
        case 'testStart':   this._onTestStart.call(this, event.data); break;
        case 'testDone':    this._onTestDone.call(this, event.data); break;
        case 'done':        this._onDone.call(this, event.data); break;
        default:
          throw 'Unknown event type: ' + event.data.eventName;
      }
    }.bind(this);
  }

  QUnitEventsClient.prototype = {
    setupTestFrame: function(container) {
      this.ui.setupTestFrame(container);
    },
    updateUI: function() {
      for (var i = 0; i < this._testModules.length; i++) {
        this.ui.addOrUpdateModule(this._testModules[i], i);
      }
    }
  };

  w.QUnitEventsClient = QUnitEventsClient;
  if (typeof define === 'function') {
    define('qunit-events/client', [], function() {
      return {
        UI: UI,
        default: QUnitEventsClient
      };
    });
  }
}(window));

export default null;