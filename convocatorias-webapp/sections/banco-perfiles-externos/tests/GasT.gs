/**
 * GasT - Google Apps Script Testing-framework
 * https://github.com/zixia/gast
 * 
 * Simple testing framework for Google Apps Script
 */

var GasTap = (function() {
  'use strict';
  
  var GasTap = {
    VERSION: '1.0.0',
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    results: []
  };
  
  /**
   * Test suite
   */
  GasTap.test = function(description, testFunction) {
    Logger.log('');
    Logger.log('========================================');
    Logger.log('TEST: ' + description);
    Logger.log('========================================');
    
    var context = {
      passed: 0,
      failed: 0,
      assertions: []
    };
    
    try {
      testFunction(context);
      
      if (context.failed === 0) {
        Logger.log('✅ PASSED - ' + description);
        Logger.log('   Assertions: ' + context.passed + ' passed');
        GasTap.passedTests++;
      } else {
        Logger.log('❌ FAILED - ' + description);
        Logger.log('   Assertions: ' + context.passed + ' passed, ' + context.failed + ' failed');
        GasTap.failedTests++;
      }
      
      GasTap.results.push({
        description: description,
        passed: context.failed === 0,
        assertions: context.assertions
      });
      
    } catch (error) {
      Logger.log('❌ ERROR - ' + description);
      Logger.log('   ' + error.toString());
      GasTap.failedTests++;
      
      GasTap.results.push({
        description: description,
        passed: false,
        error: error.toString()
      });
    }
    
    GasTap.totalTests++;
  };
  
  /**
   * Assertion: equal
   */
  GasTap.assert = function(context, condition, message) {
    if (condition) {
      Logger.log('  ✓ ' + message);
      context.passed++;
      context.assertions.push({ passed: true, message: message });
    } else {
      Logger.log('  ✗ ' + message);
      context.failed++;
      context.assertions.push({ passed: false, message: message });
    }
  };
  
  /**
   * Assertion: equal
   */
  GasTap.assertEqual = function(context, actual, expected, message) {
    var passed = actual === expected;
    var msg = message || 'Expected ' + expected + ', got ' + actual;
    
    if (passed) {
      Logger.log('  ✓ ' + msg);
      context.passed++;
      context.assertions.push({ passed: true, message: msg });
    } else {
      Logger.log('  ✗ ' + msg);
      Logger.log('    Expected: ' + JSON.stringify(expected));
      Logger.log('    Actual: ' + JSON.stringify(actual));
      context.failed++;
      context.assertions.push({ passed: false, message: msg, expected: expected, actual: actual });
    }
  };
  
  /**
   * Assertion: not equal
   */
  GasTap.assertNotEqual = function(context, actual, notExpected, message) {
    var passed = actual !== notExpected;
    var msg = message || 'Expected not to be ' + notExpected;
    
    if (passed) {
      Logger.log('  ✓ ' + msg);
      context.passed++;
      context.assertions.push({ passed: true, message: msg });
    } else {
      Logger.log('  ✗ ' + msg);
      context.failed++;
      context.assertions.push({ passed: false, message: msg });
    }
  };
  
  /**
   * Assertion: truthy
   */
  GasTap.assertTrue = function(context, value, message) {
    GasTap.assertEqual(context, !!value, true, message || 'Expected truthy value');
  };
  
  /**
   * Assertion: falsy
   */
  GasTap.assertFalse = function(context, value, message) {
    GasTap.assertEqual(context, !!value, false, message || 'Expected falsy value');
  };
  
  /**
   * Assertion: object deep equal
   */
  GasTap.assertDeepEqual = function(context, actual, expected, message) {
    var passed = JSON.stringify(actual) === JSON.stringify(expected);
    var msg = message || 'Objects should be deeply equal';
    
    if (passed) {
      Logger.log('  ✓ ' + msg);
      context.passed++;
      context.assertions.push({ passed: true, message: msg });
    } else {
      Logger.log('  ✗ ' + msg);
      Logger.log('    Expected: ' + JSON.stringify(expected));
      Logger.log('    Actual: ' + JSON.stringify(actual));
      context.failed++;
      context.assertions.push({ passed: false, message: msg, expected: expected, actual: actual });
    }
  };
  
  /**
   * Assertion: throws error
   */
  GasTap.assertThrows = function(context, fn, message) {
    var threw = false;
    try {
      fn();
    } catch (error) {
      threw = true;
    }
    
    var msg = message || 'Should throw an error';
    if (threw) {
      Logger.log('  ✓ ' + msg);
      context.passed++;
      context.assertions.push({ passed: true, message: msg });
    } else {
      Logger.log('  ✗ ' + msg);
      context.failed++;
      context.assertions.push({ passed: false, message: msg });
    }
  };
  
  /**
   * Print summary
   */
  GasTap.finish = function() {
    Logger.log('');
    Logger.log('========================================');
    Logger.log('TEST SUMMARY');
    Logger.log('========================================');
    Logger.log('Total tests: ' + GasTap.totalTests);
    Logger.log('Passed: ' + GasTap.passedTests + ' ✅');
    Logger.log('Failed: ' + GasTap.failedTests + ' ❌');
    Logger.log('Success rate: ' + (GasTap.passedTests / GasTap.totalTests * 100).toFixed(2) + '%');
    Logger.log('========================================');
    
    // Reset counters
    GasTap.totalTests = 0;
    GasTap.passedTests = 0;
    GasTap.failedTests = 0;
    GasTap.results = [];
  };
  
  return GasTap;
})();
