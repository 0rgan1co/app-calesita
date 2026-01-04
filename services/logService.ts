
export interface UsageLog {
  fecha_hora: string;
  email_usuario: string;
  inputs: string;
  resumen_output: string;
}

/**
 * Log de Usos - Opción B: Conexión Automatizada
 * Permite verificar el flujo de datos en tiempo real.
 */
export const logUsageToSheets = async (log: UsageLog): Promise<{success: boolean, payload: UsageLog}> => {
  // NOTA: Para producción, reemplazar con el Web App URL de Google Apps Script.
  const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbz_TU_WEB_APP_ID/exec';

  console.group("🚀 [VERIFICACIÓN LOGS CALESITA]");
  console.log("Payload:", log);
  console.groupEnd();

  try {
    // Si la URL es la de ejemplo, simulamos éxito para la verificación local
    if (WEBHOOK_URL.includes('WEB_APP_ID')) {
      console.info("ℹ️ [Simulación] Log capturado localmente (URL placeholder).");
      return { success: true, payload: log };
    }

    await fetch(WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(log),
    });
    
    return { success: true, payload: log };
  } catch (error) {
    console.warn("⚠️ [UX-Log] Error en el transporte de datos:", error);
    return { success: false, payload: log };
  }
};
