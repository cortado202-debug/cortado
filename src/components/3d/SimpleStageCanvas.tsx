import React, { Component, ReactNode } from 'react';
import { CoffeeStage3D } from './CoffeeStage3D';
import { Product } from '../../types';
import { Sparkles } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackProduct?: Product;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class CanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn("WebGL 3D Canvas notice:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const prod = this.props.fallbackProduct;
      return (
        <div className="relative w-full h-[320px] md:h-[400px] flex flex-col items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-b from-[#221B16] to-[#181512] border border-[#D4A373]/30 p-6 text-center">
          <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-[#D4A373] shadow-2xl mb-4 relative gold-glow">
            <img 
              src={prod?.imageUrl || 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80'} 
              alt={prod?.nameAr || 'منتج كورتادو'} 
              className="w-full h-full object-cover animate-float"
            />
          </div>
          <div className="flex items-center gap-2 text-[#D4A373] font-bold text-lg">
            <Sparkles className="w-5 h-5" />
            <span>{prod?.nameAr}</span>
          </div>
          <p className="text-xs text-[#FAEDCD]/70 mt-1">{prod?.ingredients?.join(' • ')}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export const SimpleStageCanvas: React.FC<{ product?: Product }> = ({ product }) => {
  return (
    <CanvasErrorBoundary fallbackProduct={product}>
      <CoffeeStage3D product={product} />
    </CanvasErrorBoundary>
  );
};

export default SimpleStageCanvas;
