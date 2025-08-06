import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearTrackedOrder } from '../../store/slices/orderSlice';
import OrderTracker from '../../components/sections/OrderTracker';

const TrackOrderPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const trackingId = searchParams.get('id');

  useEffect(() => {
    return () => {
      dispatch(clearTrackedOrder());
    };
  }, [dispatch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Track Your Order</h1>
      <div className="max-w-3xl mx-auto">
        <OrderTracker initialTrackingId={trackingId} />
      </div>
    </div>
  );
};

export default TrackOrderPage;