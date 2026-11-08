/**
 * Mock carrier telemetry service simulating real-time feeds from
 * FedEx, UPS, DHL, and USPS delivery verification APIs.
 */

const carrierRecords = {
  'FEDEX-94821038': {
    carrier: 'FedEx Ground',
    tracking_number: '948210389102381',
    status: 'DELIVERED',
    delivery_timestamp: '2026-11-04T14:32:18Z',
    delivered_to: 'FRONT_DOOR_PORCH',
    signed_by: 'M. REYNOLDS (Direct Signature)',
    recipient_address: {
      street: '742 Evergreen Terrace',
      city: 'Austin',
      state: 'TX',
      postal_code: '78701',
      country: 'US',
    },
    geo_coordinates: {
      latitude: 30.2672,
      longitude: -97.7431,
      accuracy_meters: 2.4,
      device: 'Handheld Honeywell ScanPal EDA52',
    },
    proof_of_delivery_photo: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
    delivery_notes: 'Package left inside covered porch vestibule. Signature confirmed by consignee.',
    transit_checkpoints: [
      { time: '2026-11-02T08:15:00Z', location: 'FedEx Facility, Dallas TX', status: 'In Transit' },
      { time: '2026-11-04T06:45:00Z', location: 'Austin TX Delivery Hub', status: 'Out for Delivery' },
      { time: '2026-11-04T14:32:18Z', location: 'Austin TX (Consignee)', status: 'Delivered' },
    ],
  },
  'UPS-38192044': {
    carrier: 'UPS 2nd Day Air',
    tracking_number: '1Z9999999999999999',
    status: 'DELIVERED',
    delivery_timestamp: '2026-10-29T11:15:40Z',
    delivered_to: 'RECEPTION_DESK',
    signed_by: 'C. VANCE',
    recipient_address: {
      street: '1200 Grand Avenue, Suite 400',
      city: 'Seattle',
      state: 'WA',
      postal_code: '98101',
      country: 'US',
    },
    geo_coordinates: {
      latitude: 47.6062,
      longitude: -122.3321,
      accuracy_meters: 1.8,
      device: 'UPS DIAD VI Terminal',
    },
    proof_of_delivery_photo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    delivery_notes: 'Signed and accepted by front reception staff.',
    transit_checkpoints: [
      { time: '2026-10-28T09:00:00Z', location: 'Ontario CA Hub', status: 'Departed' },
      { time: '2026-10-29T07:12:00Z', location: 'Seattle WA Hub', status: 'Loaded on Vehicle' },
      { time: '2026-10-29T11:15:40Z', location: 'Seattle WA', status: 'Delivered & Signed' },
    ],
  },
  'USPS-19044812': {
    carrier: 'USPS Priority Mail',
    tracking_number: '9400111899562537482910',
    status: 'DELIVERED',
    delivery_timestamp: '2026-11-01T15:10:02Z',
    delivered_to: 'PARCEL_LOCKER',
    signed_by: 'WAIVED (Secure Locker Keypad)',
    recipient_address: {
      street: '450 North Elm Street, Apt 3B',
      city: 'Chicago',
      state: 'IL',
      postal_code: '60611',
      country: 'US',
    },
    geo_coordinates: {
      latitude: 41.8988,
      longitude: -87.6229,
      accuracy_meters: 3.1,
      device: 'USPS MDD Mobile Delivery Device',
    },
    proof_of_delivery_photo: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop&q=80',
    delivery_notes: 'Secured in community parcel locker #14. Electronic access code generated for resident.',
    transit_checkpoints: [
      { time: '2026-10-30T14:20:00Z', location: 'USPS Chicago Sorting Facility', status: 'Processed' },
      { time: '2026-11-01T08:30:00Z', location: 'Chicago IL Post Office', status: 'Out for Delivery' },
      { time: '2026-11-01T15:10:02Z', location: 'Parcel Locker #14', status: 'Delivered' },
    ],
  },
  'DHL-88210941': {
    carrier: 'DHL Express Worldwide',
    tracking_number: 'DHL8821094100',
    status: 'DELIVERED',
    delivery_timestamp: '2026-10-25T16:48:22Z',
    delivered_to: 'COMMERCIAL_DROPBOX',
    signed_by: 'BOX_AGENT_DE',
    recipient_address: {
      street: '3500 Silverside Rd, Suite 105',
      city: 'Wilmington',
      state: 'DE',
      postal_code: '19810',
      country: 'US',
    },
    geo_coordinates: {
      latitude: 39.8142,
      longitude: -75.5412,
      accuracy_meters: 1.5,
      device: 'DHL Courier Mobile Scanner',
    },
    proof_of_delivery_photo: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&auto=format&fit=crop&q=80',
    delivery_notes: 'Commercial re-shipper address. Multiple packages delivered simultaneously.',
    transit_checkpoints: [
      { time: '2026-10-24T18:00:00Z', location: 'Cincinnati Hub, OH', status: 'Processed' },
      { time: '2026-10-25T16:48:22Z', location: 'Wilmington DE', status: 'Delivered' },
    ],
  },
};

function getCarrierTelemetry(trackingKey) {
  return carrierRecords[trackingKey] || {
    carrier: 'Standard Ground Delivery',
    tracking_number: trackingKey,
    status: 'DELIVERED',
    delivery_timestamp: new Date().toISOString(),
    signed_by: 'CONSIGNEE',
    geo_coordinates: { latitude: 37.7749, longitude: -122.4194, accuracy_meters: 5.0 },
    proof_of_delivery_photo: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
    delivery_notes: 'Standard residential delivery confirmed.',
  };
}

module.exports = { getCarrierTelemetry, carrierRecords };
