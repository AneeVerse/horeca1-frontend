"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect, useRef } from "react";
import { IoBagHandleOutline } from "react-icons/io5";
import { useCart } from "react-use-cart";

//internal import
import CartDrawer from "@components/drawer/CartDrawer";
import { SidebarContext } from "@context/SidebarContext";

const StickyCart = ({ currency }) => {
  const { totalItems, cartTotal } = useCart();
  const { cartDrawerOpen, setCartDrawerOpen } = React.useContext(SidebarContext);

  // Draggable floating position
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragMovedRef = useRef(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // initial position: right 24px, center vertically
    const w = typeof window !== "undefined" ? window.innerWidth : 0;
    const h = typeof window !== "undefined" ? window.innerHeight : 0;
    setPos({ x: Math.max(16, w - 120), y: Math.max(80, h / 2 - 60) });
  }, []);

  useEffect(() => {
    const handleMove = (e) => {
      if (!dragging) return;
      // mark as moved if pointer shifts a few pixels
      const dx = Math.abs(e.clientX - (pos.x + offsetRef.current.x));
      const dy = Math.abs(e.clientY - (pos.y + offsetRef.current.y));
      if (dx > 2 || dy > 2) {
        dragMovedRef.current = true;
      }
      const w = window.innerWidth;
      const h = window.innerHeight;
      const nextX = Math.min(Math.max(e.clientX - offsetRef.current.x, 10), w - 90);
      const nextY = Math.min(Math.max(e.clientY - offsetRef.current.y, 10), h - 120);
      setPos({ x: nextX, y: nextY });
    };

    const stopDrag = () => setDragging(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("mouseleave", stopDrag);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("mouseleave", stopDrag);
    };
  }, [dragging]);

  const startDrag = (e) => {
    e.preventDefault();
    dragMovedRef.current = false;
    offsetRef.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    setDragging(true);
  };

  return (
    <>
      <CartDrawer
        currency={currency}
        open={cartDrawerOpen}
        setOpen={setCartDrawerOpen}
      />
      {!cartDrawerOpen && (
        <div
          className="hidden lg:block xl:block"
          style={{ position: "fixed", left: pos.x, top: pos.y, zIndex: 40 }}
        >
          <button
            aria-label="Cart"
            onMouseDown={startDrag}
            onClick={() => {
              if (dragging || dragMovedRef.current) return;
              setCartDrawerOpen(true);
            }}
            className="cursor-grab active:cursor-grabbing shadow-lg rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <div className="flex flex-col items-center justify-center bg-indigo-50 p-2 text-gray-700">
              <span className="text-2xl mb-1 text-emerald-600">
                <IoBagHandleOutline />
              </span>
              <span className="px-2 text-sm font-medium">{totalItems} Items</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-emerald-700 p-2 text-white text-base font-medium">
              {currency}
              {cartTotal.toFixed(2)}
            </div>
          </button>
        </div>
      )}
    </>
  );
};

export default dynamic(() => Promise.resolve(StickyCart), { ssr: false });
