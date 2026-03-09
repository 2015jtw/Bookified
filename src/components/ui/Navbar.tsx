'use client';

import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Show,
  UserButton,
  SignInButton,
  SignUpButton,
  useUser,
} from '@clerk/nextjs';

const navItems = [
  {
    label: 'Library',
    href: '/',
  },
  { label: 'Add New', href: '/books/new' },
];

const Navbar = () => {
  const pathname = usePathname();
  const { user } = useUser();

  console.log(user);
  return (
    <header className="w-full fixed z-50">
      <div className="wrapper navbar-height py-4 flex justify-between items-center bg-(--bg-primary)">
        <Link href="/" className="flex gap-0.5 items-center">
          <Image
            src="/assets/logo.png"
            alt="Bookified Logo"
            width={42}
            height={26}
            className="rounded-sm"
          />
          <span className="logo-text">Bookified</span>
        </Link>
        <nav className="w-fit flex gap-7.5 items-center">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                href={item.href}
                key={item.label}
                className={cn(
                  'nav-link-base',
                  isActive ? 'nav-link-active' : 'text-black hover:opacity-70',
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="flex gap-7.5 items-center">
            <Show when="signed-out">
              <SignInButton />
              <SignUpButton />
            </Show>
            <Show when="signed-in">
              <UserButton />
              {user?.firstName && (
                <Link
                  href="/subscriptions"
                  className="nav-user-name
                "
                >
                  {user?.firstName}
                </Link>
              )}
            </Show>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
