import { useState, useCallback } from 'react';

export interface AsyncError {
  message: string;
  code?: string;
  timestamp: number;
}

export const useAsyncError = () => {
  const [error, setError] = useState<AsyncError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: unknown, code?: string) => {
    let message = 'Ocorreu um erro inesperado';
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    // Mapear erros específicos para mensagens mais amigáveis
    if (message.includes('Network request failed')) {
      message = 'Erro de conexão. Verifique sua internet e tente novamente.';
    } else if (message.includes('Permission to access location was denied')) {
      message = 'É necessário permitir o acesso à localização para usar esta funcionalidade.';
    } else if (message.includes('Location services are disabled')) {
      message = 'Ative os serviços de localização nas configurações do dispositivo.';
    } else if (message.includes('timeout')) {
      message = 'A operação demorou mais que o esperado. Tente novamente.';
    }

    setError({
      message,
      code,
      timestamp: Date.now(),
    });
  }, []);

  const executeAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    errorCode?: string
  ): Promise<T | null> => {
    try {
      setIsLoading(true);
      clearError();
      const result = await asyncFn();
      return result;
    } catch (err) {
      handleError(err, errorCode);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError]);

  const retry = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    errorCode?: string
  ): Promise<T | null> => {
    clearError();
    return executeAsync(asyncFn, errorCode);
  }, [executeAsync, clearError]);

  return {
    error,
    isLoading,
    clearError,
    handleError,
    executeAsync,
    retry,
  };
};

export default useAsyncError;