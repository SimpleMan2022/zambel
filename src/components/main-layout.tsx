import React from 'react';
import { Navbar } from '@/components/navbar';
import { FooterSection } from '@/components/footer-section';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="pt-16">{children}</main>
      <FooterSection />
    </>
  );
}
