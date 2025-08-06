import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import ProductCard from '../../components/common/ProductCard';

const ProductRoller = ({ products }) => {
  const containerRef = useRef(null);
  const controls = useAnimation();
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      const totalWidth = containerRef.current.scrollWidth;
      const visibleWidth = containerRef.current.offsetWidth;
      setContainerWidth(totalWidth - visibleWidth);
    }
  }, [products]);

  useEffect(() => {
    if (containerWidth > 0) {
      controls.start({
        x: -containerWidth,
        transition: {
          duration: 30,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        },
      });
    }
  }, [containerWidth, controls]);

  return (
    <div className="hidden lg:block absolute top-32 right-4 w-[420px] h-[450px] z-50 overflow-hidden rounded-xl  ">
      <motion.div
        className="flex gap-4 p-4"
        ref={containerRef}
        animate={controls}
        initial={{ x: 0 }}
      >
        {[...products, ...products].map((product, i) => (
          <div key={i} className="w-72 shrink-0">
            <ProductCard product={product} compact />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default ProductRoller;
