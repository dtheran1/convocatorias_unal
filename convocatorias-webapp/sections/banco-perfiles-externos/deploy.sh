#!/bin/bash
# Script de despliegue para Banco de Perfiles Externos
# Uso: ./deploy.sh [version]

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Banco de Perfiles Externos - Deploy  ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "banco-perfiles-externos.html" ]; then
    echo -e "${RED}Error: No se encuentra banco-perfiles-externos.html${NC}"
    echo "Asegúrate de ejecutar este script desde el directorio banco-perfiles-externos/"
    exit 1
fi

# Verificar que clasp está instalado
if ! command -v clasp &> /dev/null; then
    echo -e "${RED}Error: clasp no está instalado${NC}"
    echo "Instala clasp con: npm install -g @google/clasp"
    exit 1
fi

# Verificar que .clasp.json tiene scriptId
if ! grep -q '"scriptId": "[^"]' .clasp.json; then
    echo -e "${YELLOW}⚠️  .clasp.json no tiene scriptId configurado${NC}"
    echo ""
    echo "Opciones:"
    echo "1. Crear nuevo proyecto: clasp create --type webapp --title 'Banco Perfiles Externos'"
    echo "2. Agregar scriptId manualmente a .clasp.json"
    exit 1
fi

# Mostrar información del proyecto
echo -e "${BLUE}📦 Proyecto:${NC}"
SCRIPT_ID=$(grep -o '"scriptId": "[^"]*"' .clasp.json | cut -d'"' -f4)
echo "   Script ID: $SCRIPT_ID"
echo ""

# Confirmar antes de continuar
read -p "¿Continuar con el despliegue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Despliegue cancelado."
    exit 1
fi

# Paso 1: Push del código
echo ""
echo -e "${BLUE}📤 Subiendo código a Apps Script...${NC}"
clasp push

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Código subido exitosamente${NC}"
else
    echo -e "${RED}✗ Error al subir código${NC}"
    exit 1
fi

# Paso 2: Crear versión (opcional)
VERSION=${1:-"v1.0"}
echo ""
echo -e "${BLUE}📌 Creando versión: $VERSION${NC}"
clasp version "$VERSION"

# Paso 3: Deploy
echo ""
echo -e "${BLUE}🚀 Creando implementación...${NC}"
DEPLOY_OUTPUT=$(clasp deploy --description "$VERSION" --deploymentId @latest 2>&1)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Implementación creada exitosamente${NC}"
    echo ""
    echo -e "${BLUE}📋 Implementaciones actuales:${NC}"
    clasp deployments
else
    echo -e "${RED}✗ Error al crear implementación${NC}"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

# Paso 4: Abrir en navegador (opcional)
echo ""
read -p "¿Abrir proyecto en el navegador? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    clasp open
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ Despliegue completado exitosamente${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "1. Verifica que la pestaña 'Perfiles Externos' existe en el Sheet"
echo "2. Ejecuta setupBancoPerfilesExternos() en Apps Script (si no lo hiciste antes)"
echo "3. Prueba el formulario desde la URL /exec"
echo "4. Embebe la URL en Google Sites"
echo ""
