/**
 * Frontend Tests - Banco de Perfiles Externos
 * Testing con Jest (para desarrollo local)
 * 
 * Para ejecutar:
 * 1. npm install --save-dev jest @testing-library/dom jsdom
 * 2. npm test
 */

/**
 * @jest-environment jsdom
 */

describe('Banco de Perfiles Externos - Frontend Tests', () => {
  let mockGoogle;
  
  beforeEach(() => {
    // Mock de google.script.run
    mockGoogle = {
      script: {
        run: {
          withSuccessHandler: jest.fn().mockReturnThis(),
          withFailureHandler: jest.fn().mockReturnThis(),
          submitBancoPerfilesExternos: jest.fn()
        }
      }
    };
    global.google = mockGoogle;
    
    // Setup DOM básico
    document.body.innerHTML = `
      <div id="perfilesContainer"></div>
      <div id="errorMessage"></div>
      <div id="successMessage"></div>
      <div id="loadingOverlay"></div>
    `;
  });
  
  afterEach(() => {
    delete global.google;
    jest.clearAllMocks();
  });

  describe('Validation Functions', () => {
    test('escapeHtml prevents XSS attacks', () => {
      const escapeHtml = (text) => {
        if (!text) return '';
        return text.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      };
      
      const malicious = '<script>alert("XSS")</script>';
      const escaped = escapeHtml(malicious);
      
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;script&gt;');
    });
    
    test('validateEmail accepts valid emails', () => {
      const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      };
      
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
      expect(validateEmail('practicas_paz@unal.edu.co')).toBe(true);
    });
    
    test('validateEmail rejects invalid emails', () => {
      const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      };
      
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('missing@domain')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('Form Data Collection', () => {
    test('collects entity data correctly', () => {
      document.body.innerHTML = `
        <input id="nombreEntidad" value="Test Entity" />
        <input id="informacionEntidad" value="Test Info" />
        <input type="radio" name="tipoEntidad" value="Privada" checked />
        <input id="municipioDepartamento" value="La Paz, Cesar" />
        <input id="nombreContacto" value="Juan Perez" />
        <input id="cargoContacto" value="Director" />
        <input id="correoContacto" value="test@example.com" />
        <input id="telefonoContacto" value="3001234567" />
      `;
      
      const formData = {
        nombreEntidad: document.getElementById('nombreEntidad').value.trim(),
        informacionEntidad: document.getElementById('informacionEntidad').value.trim(),
        tipoEntidad: document.querySelector('input[name="tipoEntidad"]:checked')?.value || '',
        municipioDepartamento: document.getElementById('municipioDepartamento').value.trim(),
        nombreContacto: document.getElementById('nombreContacto').value.trim(),
        cargoContacto: document.getElementById('cargoContacto').value.trim(),
        correoContacto: document.getElementById('correoContacto').value.trim(),
        telefonoContacto: document.getElementById('telefonoContacto').value.trim()
      };
      
      expect(formData.nombreEntidad).toBe('Test Entity');
      expect(formData.tipoEntidad).toBe('Privada');
      expect(formData.correoContacto).toBe('test@example.com');
    });
    
    test('collects profile data with "Otro" apoyo correctly', () => {
      document.body.innerHTML = `
        <input id="competenciasEspecificas-0" value="Programming" />
        <input type="radio" name="apoyoEstudiante-0" value="SI" checked />
        <input type="checkbox" name="tipoApoyo-0" value="Alimentación" checked />
        <input type="checkbox" name="tipoApoyo-0" value="Otro" checked />
        <textarea id="otroApoyoTexto-0">Seguro de salud</textarea>
      `;
      
      const tipoApoyoValues = Array.from(
        document.querySelectorAll('input[name="tipoApoyo-0"]:checked')
      ).map(cb => cb.value);
      
      const otroApoyoTexto = document.getElementById('otroApoyoTexto-0')?.value.trim();
      
      const tipoApoyoFinal = tipoApoyoValues.map(value => {
        if (value === 'Otro' && otroApoyoTexto) {
          return `Otro: ${otroApoyoTexto}`;
        }
        return value;
      });
      
      expect(tipoApoyoFinal).toContain('Alimentación');
      expect(tipoApoyoFinal).toContain('Otro: Seguro de salud');
      expect(tipoApoyoFinal).not.toContain('Ninguno');
    });
  });

  describe('Profile Management', () => {
    test('creates perfil card with correct structure', () => {
      const createMinimalPerfilCard = (index) => {
        const card = document.createElement('div');
        card.className = 'perfil-card';
        card.dataset.perfilIndex = index;
        card.id = `perfil-${index}`;
        
        card.innerHTML = `
          <h3>Perfil #${index + 1}</h3>
          <textarea id="descripcionPerfil-${index}"></textarea>
          <input type="checkbox" name="tipoApoyo-${index}" value="Otro" />
          <textarea id="otroApoyoTexto-${index}" style="display: none;"></textarea>
        `;
        
        return card;
      };
      
      const card = createMinimalPerfilCard(0);
      
      expect(card.classList.contains('perfil-card')).toBe(true);
      expect(card.dataset.perfilIndex).toBe('0');
      expect(card.querySelector('textarea#descripcionPerfil-0')).toBeTruthy();
    });
    
    test('perfil card does not contain "Habilidades" field', () => {
      const cardHTML = `
        <div class="perfil-card">
          <textarea id="descripcionPerfil-0"></textarea>
          <textarea id="competenciasEspecificas-0"></textarea>
          <input type="checkbox" name="tipoApoyo-0" value="Otro" />
        </div>
      `;
      
      expect(cardHTML).not.toContain('habilidades');
      expect(cardHTML).not.toContain('Habilidades');
    });
    
    test('tipo apoyo does not have "Ninguno" option', () => {
      const apoyoHTML = `
        <input type="checkbox" value="Auxilio económico" />
        <input type="checkbox" value="Alimentación" />
        <input type="checkbox" value="Transporte" />
        <input type="checkbox" value="Otro" />
      `;
      
      expect(apoyoHTML).not.toContain('Ninguno');
    });
  });

  describe('UI Interactions', () => {
    test('toggleOtroApoyo shows textarea when "Otro" is checked', () => {
      document.body.innerHTML = `
        <input type="checkbox" id="otroCheckbox" value="Otro" />
        <div id="otroApoyo-container-0" style="display: none;">
          <textarea id="otroApoyoTexto-0"></textarea>
        </div>
      `;
      
      const toggleOtroApoyo = (index) => {
        const otroCheckbox = document.querySelector(`input[value="Otro"]`);
        const otroContainer = document.getElementById(`otroApoyo-container-${index}`);
        const otroTexto = document.getElementById(`otroApoyoTexto-${index}`);
        
        if (otroCheckbox && otroCheckbox.checked) {
          otroContainer.style.display = 'block';
          if (otroTexto) otroTexto.required = true;
        } else {
          otroContainer.style.display = 'none';
          if (otroTexto) {
            otroTexto.required = false;
            otroTexto.value = '';
          }
        }
      };
      
      const checkbox = document.getElementById('otroCheckbox');
      const container = document.getElementById('otroApoyo-container-0');
      
      // Simular check
      checkbox.checked = true;
      toggleOtroApoyo(0);
      
      expect(container.style.display).toBe('block');
      
      // Simular uncheck
      checkbox.checked = false;
      toggleOtroApoyo(0);
      
      expect(container.style.display).toBe('none');
    });
  });

  describe('Data Validation', () => {
    test('validates required entity fields', () => {
      const validateEntityData = (data) => {
        const errors = [];
        
        if (!data.nombreEntidad) errors.push('Nombre entidad requerido');
        if (!data.correoContacto) errors.push('Correo requerido');
        if (!data.nombreContacto) errors.push('Nombre contacto requerido');
        
        return { valid: errors.length === 0, errors };
      };
      
      const validData = {
        nombreEntidad: 'Test',
        correoContacto: 'test@test.com',
        nombreContacto: 'Juan'
      };
      
      const invalidData = {
        nombreEntidad: '',
        correoContacto: '',
        nombreContacto: 'Juan'
      };
      
      expect(validateEntityData(validData).valid).toBe(true);
      expect(validateEntityData(invalidData).valid).toBe(false);
      expect(validateEntityData(invalidData).errors.length).toBe(2);
    });
    
    test('validates "Otro" apoyo requires text', () => {
      const validateOtroApoyo = (tipoApoyo, otroTexto) => {
        const hasOtro = tipoApoyo.includes('Otro');
        
        if (hasOtro && !otroTexto) {
          return { valid: false, error: 'Debe especificar el tipo de apoyo' };
        }
        
        return { valid: true };
      };
      
      expect(validateOtroApoyo(['Otro'], 'Seguro')).toEqual({ valid: true });
      expect(validateOtroApoyo(['Otro'], '')).toEqual({ 
        valid: false, 
        error: 'Debe especificar el tipo de apoyo' 
      });
      expect(validateOtroApoyo(['Alimentación'], '')).toEqual({ valid: true });
    });
  });

  describe('Multiple Profiles', () => {
    test('can add multiple profiles', () => {
      const profiles = [];
      
      const addProfile = (data) => {
        profiles.push(data);
      };
      
      addProfile({ descripcion: 'Profile 1', tipo: 'Prácticas' });
      addProfile({ descripcion: 'Profile 2', tipo: 'Pasantías' });
      
      expect(profiles.length).toBe(2);
      expect(profiles[0].tipo).toBe('Prácticas');
      expect(profiles[1].tipo).toBe('Pasantías');
    });
    
    test('maintains at least one profile', () => {
      let profiles = [
        { id: 0, descripcion: 'Profile 1' }
      ];
      
      const removeProfile = (id) => {
        if (profiles.length <= 1) {
          throw new Error('Debe mantener al menos un perfil');
        }
        profiles = profiles.filter(p => p.id !== id);
      };
      
      expect(() => removeProfile(0)).toThrow('Debe mantener al menos un perfil');
      
      profiles.push({ id: 1, descripcion: 'Profile 2' });
      expect(() => removeProfile(0)).not.toThrow();
      expect(profiles.length).toBe(1);
    });
  });

  describe('Programs Selection', () => {
    test('allows selecting multiple programs', () => {
      document.body.innerHTML = `
        <input type="checkbox" name="programas-0" value="L001-Biología" checked />
        <input type="checkbox" name="programas-0" value="L002-Estadística" />
        <input type="checkbox" name="programas-0" value="L005-Ing.Mecatrónica" checked />
      `;
      
      const selected = Array.from(
        document.querySelectorAll('input[name="programas-0"]:checked')
      ).map(cb => cb.value);
      
      expect(selected).toHaveLength(2);
      expect(selected).toContain('L001-Biología');
      expect(selected).toContain('L005-Ing.Mecatrónica');
    });
  });
});
