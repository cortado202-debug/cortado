/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Header } from './components/header/Header';
import { MenuSection } from './components/menu/MenuSection';
import { CouponValidator } from './components/coupon/CouponValidator';
import { Footer } from './components/footer/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/cart/CheckoutModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminOrderNotification } from './components/admin/AdminOrderNotification';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { AuthModal } from './components/auth/AuthModal';
import { ClosedStoreModal } from './components/common/ClosedStoreModal';
import { FloatingBeans } from './components/common/FloatingBeans';
import { FlyToCartParticle } from './components/common/FlyToCartParticle';

export default function App() {
  return (
    <div className="min-h-screen bg-white text-[#2A2118] flex flex-col font-['Tajawal',sans-serif] selection:bg-[#00A859] selection:text-white relative overflow-x-hidden">
      {/* Flying Particle Animation */}
      <FlyToCartParticle />

      {/* Floating Animated Coffee Beans Background */}
      <FloatingBeans />

      {/* Navigation Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {/* Products Showcase */}
        <MenuSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Modals & Drawers */}
      <AdminOrderNotification />
      <CartDrawer />
      <CheckoutModal />
      <AdminDashboard />
      <CouponValidator />
      <UserProfileModal />
      <AuthModal />
      <ClosedStoreModal />
    </div>
  );
}

