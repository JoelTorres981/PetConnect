import React, { createContext, useContext, useState, useRef } from 'react';
import { btnCancel } from '../helpers/formStyles';

const ConfirmContext = createContext();

export const ConfirmProvider = ({ children }) => {
    const [state, setState] = useState({
        isOpen: false,
        title: 'Confirmación',
        message: '',
        confirmLabel: 'Aceptar',
        cancelLabel: 'Cancelar',
        variant: 'danger', // 'danger' | 'warning' | 'primary'
    });

    const resolver = useRef();

    const confirm = (options) => {
        setState({
            isOpen: true,
            title: options.title || '¿Estás seguro?',
            message: options.message || '',
            confirmLabel: options.confirmLabel || 'Confirmar',
            cancelLabel: options.cancelLabel || 'Cancelar',
            variant: options.variant || 'danger',
        });
        return new Promise((resolve) => {
            resolver.current = resolve;
        });
    };

    const handleConfirm = () => {
        setState(prev => ({ ...prev, isOpen: false }));
        if (resolver.current) resolver.current(true);
    };

    const handleCancel = () => {
        setState(prev => ({ ...prev, isOpen: false }));
        if (resolver.current) resolver.current(false);
    };

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {state.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative border border-secondary/10 transform scale-100 transition-all duration-300">
                        {/* Icono de advertencia */}
                        <div className="flex flex-col items-center text-center space-y-3">
                            <div className={`p-4 rounded-full ${
                                state.variant === 'danger' ? 'bg-red-50 text-red-500' :
                                state.variant === 'warning' ? 'bg-amber-50 text-amber-500' :
                                'bg-primary/10 text-primary'
                            }`}>
                                <span className="text-3xl">
                                    {state.variant === 'danger' ? '⚠️' : state.variant === 'warning' ? '❓' : '💡'}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-secondary">{state.title}</h3>
                            <p className="text-sm text-secondary/60 leading-relaxed max-w-xs">{state.message}</p>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleCancel}
                                className={`${btnCancel} flex-1 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all duration-300`}
                            >
                                {state.cancelLabel}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all duration-300 ${
                                    state.variant === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' :
                                    state.variant === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200' :
                                    'bg-primary hover:bg-primary-hover shadow-primary-light'
                                }`}
                            >
                                {state.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm debe ser usado dentro de un ConfirmProvider');
    }
    return context;
};
