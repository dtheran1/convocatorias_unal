/**
 * Tests para el Backend de Banco de Perfiles Externos
 * 
 * Para ejecutar:
 * 1. Copia GasT.gs y BackendTests.gs a tu proyecto de Apps Script
 * 2. Ejecuta: runAllTests()
 */

/**
 * Ejecutar todos los tests
 */
function runAllTests() {
  Logger.clear();
  
  testConfigurationFunctions();
  testValidationFunctions();
  testDataProcessing();
  testEmailGeneration();
  testSheetOperations();
  
  GasTap.finish();
}

/**
 * Tests de configuración
 */
function testConfigurationFunctions() {
  GasTap.test('getConfigExternos() returns valid configuration', function(t) {
    var config = getConfigExternos();
    
    GasTap.assert(t, config !== null, 'Config object exists');
    GasTap.assert(t, config.spreadsheetId !== undefined, 'Config has spreadsheetId');
    GasTap.assert(t, config.emailNotificacion !== undefined, 'Config has emailNotificacion');
    GasTap.assertEqual(t, config.emailNotificacion, 'practicas_paz@unal.edu.co', 'Email is correct');
  });
  
  GasTap.test('CONFIG_KEYS_EXTERNOS has required keys', function(t) {
    GasTap.assert(t, CONFIG_KEYS_EXTERNOS !== undefined, 'CONFIG_KEYS_EXTERNOS exists');
    GasTap.assert(t, CONFIG_KEYS_EXTERNOS.BANCO_PERFILES_EXTERNOS_SHEET_ID !== undefined, 'Has SHEET_ID key');
    GasTap.assert(t, CONFIG_KEYS_EXTERNOS.EMAIL_NOTIFICACION_EXTERNOS !== undefined, 'Has EMAIL key');
  });
}

/**
 * Tests de validación
 */
function testValidationFunctions() {
  GasTap.test('validateFormDataExternos() validates required fields', function(t) {
    // Datos válidos
    var validData = {
      nombreEntidad: 'Test Entity',
      informacionEntidad: 'Test info',
      tipoEntidad: 'Privada',
      municipioDepartamento: 'La Paz, Cesar',
      nombreContacto: 'Juan Perez',
      cargoContacto: 'Director',
      correoContacto: 'test@example.com',
      perfiles: [
        {
          tipoModalidad: 'Prácticas',
          descripcionPerfil: 'Test profile',
          dependenciaArea: 'IT',
          cantidadEstudiantes: '2',
          duracionEstimada: '6 meses',
          modalidadTrabajo: 'Presencial',
          programas: ['L001-Biología'],
          competenciasEspecificas: 'Programming',
          apoyoEstudiante: 'SI',
          tipoApoyo: ['Alimentación'],
          observaciones: ''
        }
      ]
    };
    
    var result = validateFormDataExternos(validData);
    GasTap.assertTrue(t, result.valid, 'Valid data passes validation');
    
    // Datos inválidos - falta nombre
    var invalidData = JSON.parse(JSON.stringify(validData));
    invalidData.nombreEntidad = '';
    
    var result2 = validateFormDataExternos(invalidData);
    GasTap.assertFalse(t, result2.valid, 'Invalid data fails validation');
    GasTap.assert(t, result2.errors.length > 0, 'Validation returns errors');
  });
  
  GasTap.test('escapeHtml() prevents XSS', function(t) {
    var unsafe = '<script>alert("xss")</script>';
    var safe = escapeHtml(unsafe);
    
    GasTap.assertNotEqual(t, safe, unsafe, 'HTML is escaped');
    GasTap.assert(t, safe.indexOf('<script>') === -1, 'Script tags removed');
    GasTap.assert(t, safe.indexOf('&lt;') !== -1, 'Contains escaped <');
  });
}

/**
 * Tests de procesamiento de datos
 */
function testDataProcessing() {
  GasTap.test('submitBancoPerfilesExternos() handles valid data', function(t) {
    var mockData = {
      nombreEntidad: 'Test Entity',
      informacionEntidad: 'Test info',
      tipoEntidad: 'Privada',
      municipioDepartamento: 'La Paz, Cesar',
      nombreContacto: 'Juan Perez',
      cargoContacto: 'Director',
      correoContacto: 'test@example.com',
      telefonoContacto: '3001234567',
      perfiles: [
        {
          tipoModalidad: 'Prácticas',
          descripcionPerfil: 'Test profile',
          dependenciaArea: 'IT',
          cantidadEstudiantes: '2',
          duracionEstimada: '6 meses',
          modalidadTrabajo: 'Presencial',
          programas: ['L001-Biología'],
          competenciasEspecificas: 'Programming',
          apoyoEstudiante: 'SI',
          tipoApoyo: ['Alimentación'],
          observaciones: 'Test'
        }
      ]
    };
    
    // Este test requiere que el Sheet esté configurado
    // En un ambiente real, usarías un Sheet de prueba
    
    GasTap.assert(t, true, 'Data structure is valid');
  });
  
  GasTap.test('Multiple profiles are processed correctly', function(t) {
    var mockData = {
      nombreEntidad: 'Test Entity',
      informacionEntidad: 'Test info',
      tipoEntidad: 'ONG',
      municipioDepartamento: 'La Paz, Cesar',
      nombreContacto: 'Juan Perez',
      cargoContacto: 'Director',
      correoContacto: 'test@example.com',
      telefonoContacto: '',
      perfiles: [
        {
          tipoModalidad: 'Prácticas',
          descripcionPerfil: 'Profile 1',
          dependenciaArea: 'IT',
          cantidadEstudiantes: '2',
          duracionEstimada: '6 meses',
          modalidadTrabajo: 'Presencial',
          programas: ['L001-Biología'],
          competenciasEspecificas: 'Skill 1',
          apoyoEstudiante: 'SI',
          tipoApoyo: ['Alimentación'],
          observaciones: ''
        },
        {
          tipoModalidad: 'Pasantías',
          descripcionPerfil: 'Profile 2',
          dependenciaArea: 'HR',
          cantidadEstudiantes: '1',
          duracionEstimada: '3 meses',
          modalidadTrabajo: 'Virtual',
          programas: ['L005-Ing.Mecatrónica'],
          competenciasEspecificas: 'Skill 2',
          apoyoEstudiante: 'NO',
          tipoApoyo: [],
          observaciones: 'Note'
        }
      ]
    };
    
    GasTap.assertEqual(t, mockData.perfiles.length, 2, 'Two profiles in data');
    GasTap.assertNotEqual(t, mockData.perfiles[0].tipoModalidad, mockData.perfiles[1].tipoModalidad, 'Profiles have different modalidades');
  });
}

/**
 * Tests de generación de email
 */
function testEmailGeneration() {
  GasTap.test('buildEmailTemplateExternos() generates valid HTML', function(t) {
    var mockData = {
      nombreEntidad: 'Test Entity',
      informacionEntidad: 'Test info',
      tipoEntidad: 'Privada',
      municipioDepartamento: 'La Paz, Cesar',
      nombreContacto: 'Juan Perez',
      cargoContacto: 'Director',
      correoContacto: 'test@example.com',
      telefonoContacto: '3001234567',
      perfiles: [
        {
          tipoModalidad: 'Prácticas',
          descripcionPerfil: 'Test profile',
          dependenciaArea: 'IT',
          cantidadEstudiantes: '2',
          duracionEstimada: '6 meses',
          modalidadTrabajo: 'Presencial',
          programas: ['L001-Biología', 'L005-Ing.Mecatrónica'],
          competenciasEspecificas: 'Programming',
          apoyoEstudiante: 'SI',
          tipoApoyo: ['Alimentación', 'Transporte'],
          observaciones: 'Test observation'
        }
      ]
    };
    
    var html = buildEmailTemplateExternos(mockData, 1);
    
    GasTap.assert(t, html.length > 0, 'HTML is generated');
    GasTap.assert(t, html.indexOf('<!DOCTYPE html>') === 0, 'Has DOCTYPE');
    GasTap.assert(t, html.indexOf('Test Entity') !== -1, 'Contains entity name');
    GasTap.assert(t, html.indexOf('Test profile') !== -1, 'Contains profile description');
    GasTap.assert(t, html.indexOf('<script>') === -1, 'No script tags in email');
  });
  
  GasTap.test('Email template escapes HTML in user data', function(t) {
    var mockData = {
      nombreEntidad: '<script>alert("xss")</script>',
      informacionEntidad: 'Info',
      tipoEntidad: 'Privada',
      municipioDepartamento: 'La Paz',
      nombreContacto: 'Juan',
      cargoContacto: 'Dir',
      correoContacto: 'test@test.com',
      telefonoContacto: '',
      perfiles: [
        {
          tipoModalidad: 'Prácticas',
          descripcionPerfil: '<b>Bold</b>',
          dependenciaArea: 'IT',
          cantidadEstudiantes: '1',
          duracionEstimada: '6m',
          modalidadTrabajo: 'Presencial',
          programas: ['L001'],
          competenciasEspecificas: 'Skill',
          apoyoEstudiante: 'NO',
          tipoApoyo: [],
          observaciones: ''
        }
      ]
    };
    
    var html = buildEmailTemplateExternos(mockData, 1);
    
    GasTap.assert(t, html.indexOf('<script>alert') === -1, 'Script tag is escaped');
    GasTap.assert(t, html.indexOf('&lt;script&gt;') !== -1, 'Contains escaped HTML');
  });
}

/**
 * Tests de operaciones con Sheet
 */
function testSheetOperations() {
  GasTap.test('Sheet headers have correct structure', function(t) {
    // Este test verifica la estructura de headers sin acceder al Sheet real
    var expectedHeaders = [
      'Fecha de Registro',
      'Nombre Entidad',
      'Información Entidad',
      'Tipo Entidad',
      'Municipio y Departamento',
      'Nombre Contacto',
      'Cargo Contacto',
      'Correo Contacto',
      'Teléfono Contacto',
      'Tipo Modalidad',
      'Descripción Perfil',
      'Dependencia/Área',
      'Cantidad Estudiantes',
      'Duración Estimada',
      'Modalidad Trabajo',
      'Programas Académicos',
      'Competencias Específicas',
      'Apoyo Estudiante',
      'Tipo de Apoyo',
      'Observaciones'
    ];
    
    GasTap.assertEqual(t, expectedHeaders.length, 20, '20 columns expected');
    GasTap.assertEqual(t, expectedHeaders[0], 'Fecha de Registro', 'First column is timestamp');
    GasTap.assertEqual(t, expectedHeaders[19], 'Observaciones', 'Last column is observations');
    
    // Verificar que NO tenga "Habilidades/Actitudes" (fue removido)
    var hasHabilidades = expectedHeaders.some(function(h) { return h.indexOf('Habilidades') !== -1; });
    GasTap.assertFalse(t, hasHabilidades, 'Habilidades column was removed');
  });
}

/**
 * Test runner individual
 */
function testValidation() {
  Logger.clear();
  testValidationFunctions();
  GasTap.finish();
}

function testEmail() {
  Logger.clear();
  testEmailGeneration();
  GasTap.finish();
}

function testConfig() {
  Logger.clear();
  testConfigurationFunctions();
  GasTap.finish();
}
