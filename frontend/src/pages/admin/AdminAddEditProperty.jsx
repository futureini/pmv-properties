import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiX, FiUploadCloud } from 'react-icons/fi';
import AdminLayout from './AdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import api from '../../api.js';
import SafeImage from '../../components/SafeImage.jsx';
import { CATEGORIES } from '../../utils/categories.js';

const MAX_IMAGES = 5;

// Which optional fields make sense for each category. Bedrooms/bathrooms don't
// apply to land, "/month" price unit doesn't apply to a one-time sale, lease
// duration only matters for Lease, etc. Adjust this table any time the rules
// change — every field below is looked up from here, nowhere else.
const CATEGORY_FIELDS = {
  'buy-sale': {
    priceUnit: false, // one-time purchase price
    bedrooms: true,
    bathrooms: true,
    floor: true,
    facing: true,
    parking: true,
    water: true,
    availableFrom: true,
    leaseDuration: false,
  },
  rent: {
    priceUnit: true, // e.g. "/month"
    bedrooms: true,
    bathrooms: true,
    floor: true,
    facing: false,
    parking: true,
    water: true,
    availableFrom: true,
    leaseDuration: false,
  },
  'land-plot': {
    priceUnit: false, // one-time purchase price
    bedrooms: false,
    bathrooms: false,
    floor: false,
    facing: true,
    parking: false,
    water: false,
    availableFrom: false,
    leaseDuration: false,
  },
  flat: {
    priceUnit: true, // flats are usually listed for rent; leave blank for a sale flat
    bedrooms: true,
    bathrooms: true,
    floor: true,
    facing: true,
    parking: true,
    water: true,
    availableFrom: true,
    leaseDuration: false,
  },
  'shop-commercial': {
    priceUnit: true, // e.g. "/month" for a rented shop; leave blank for sale
    bedrooms: false,
    bathrooms: true,
    floor: true,
    facing: true,
    parking: true,
    water: true,
    availableFrom: true,
    leaseDuration: false,
  },
  lease: {
    priceUnit: false, // leases quote a lease duration instead of a recurring unit
    bedrooms: false,
    bathrooms: false,
    floor: true,
    facing: true,
    parking: true,
    water: true,
    availableFrom: true,
    leaseDuration: true,
  },
};

const emptyForm = {
  title: '',
  category: 'buy-sale',
  propertyType: 'House',
  listingType: 'Sale',
  price: '',
  priceUnit: '',
  location: '',
  address: '',
  area: '',
  areaUnit: 'sq.ft',
  bedrooms: '',
  bathrooms: '',
  floor: '',
  parkingAvailable: false,
  waterSupply: false,
  facing: '',
  leaseDuration: '',
  availableFrom: '',
  description: '',
  ownerName: '',
  ownerPhone: '',
  status: 'Active',
};

export default function AdminAddEditProperty() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState([]); // [{url, publicId}]
  const [removedUrls, setRemovedUrls] = useState([]);
  const [newFiles, setNewFiles] = useState([]); // File[]
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/properties/admin/${id}`).then(({ data }) => {
      const p = data.property;
      setForm({
        ...emptyForm,
        ...p,
        price: p.price ?? '',
        area: p.area ?? '',
        bedrooms: p.bedrooms ?? '',
        bathrooms: p.bathrooms ?? '',
      });
      setExistingImages(p.images || []);
      setLoading(false);
    });
  }, [id, isEdit]);

  const totalImageCount = existingImages.length - removedUrls.length + newFiles.length;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const next = { ...form, [name]: type === 'checkbox' ? checked : value };

    // Switching category can hide fields that no longer apply (e.g. "/month"
    // price unit on a Buy/Sale property) — clear them so a stale value from
    // the previous category never gets saved silently.
    if (name === 'category') {
      const nextFields = CATEGORY_FIELDS[value] || CATEGORY_FIELDS['buy-sale'];
      if (!nextFields.priceUnit) next.priceUnit = '';
      if (!nextFields.bedrooms) next.bedrooms = '';
      if (!nextFields.bathrooms) next.bathrooms = '';
      if (!nextFields.floor) next.floor = '';
      if (!nextFields.facing) next.facing = '';
      if (!nextFields.leaseDuration) next.leaseDuration = '';
      if (!nextFields.availableFrom) next.availableFrom = '';
      if (!nextFields.parking) next.parkingAvailable = false;
      if (!nextFields.water) next.waterSupply = false;
    }

    setForm(next);
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const allowedMore = MAX_IMAGES - totalImageCount;
    if (allowedMore <= 0) {
      setError(`You can only have up to ${MAX_IMAGES} images.`);
      return;
    }
    setNewFiles([...newFiles, ...files.slice(0, allowedMore)]);
    e.target.value = '';
  };

  const removeExisting = (url) => setRemovedUrls([...removedUrls, url]);
  const removeNewFile = (idx) => setNewFiles(newFiles.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === 'images' || key === '_id' || key === 'createdAt' || key === 'updatedAt' || key === '__v') return;
        fd.append(key, val ?? '');
      });
      newFiles.forEach((file) => fd.append('images', file));
      if (isEdit && removedUrls.length) fd.append('removedImageUrls', JSON.stringify(removedUrls));

      if (isEdit) {
        await api.put(`/properties/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/properties', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      navigate('/admin/properties');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the property. Please check the form.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loader label="Loading property..." />
      </AdminLayout>
    );
  }

  const fields = CATEGORY_FIELDS[form.category] || CATEGORY_FIELDS['buy-sale'];

  return (
    <AdminLayout>
      <Helmet>
        <title>{isEdit ? 'Edit Property' : 'Add Property'} | PMV Properties Admin</title>
      </Helmet>
      <h1 className="text-lg font-bold text-ink mb-4">{isEdit ? 'Edit Property' : 'Add Property'}</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl2 shadow-card p-4 sm:p-5 max-w-3xl space-y-5">
        <Section title="Basic Details">
          <Grid>
            <TextField label="Title" name="title" value={form.title} onChange={handleChange} required span={2} />
            <SelectField
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              options={CATEGORIES.map((c) => ({ value: c.slug, label: c.label }))}
            />
            <SelectField
              label="Listing Type"
              name="listingType"
              value={form.listingType}
              onChange={handleChange}
              options={['Sale', 'Rent', 'Lease'].map((v) => ({ value: v, label: v }))}
            />
            <TextField label="Property Type" name="propertyType" value={form.propertyType} onChange={handleChange} placeholder="House, Flat, Land, Shop..." />
            <SelectField
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={['Active', 'Inactive'].map((v) => ({ value: v, label: v }))}
            />
          </Grid>
        </Section>

        <Section title="Location">
          <Grid>
            <TextField label="Location (e.g. Pudukkottai)" name="location" value={form.location} onChange={handleChange} required />
            <TextField label="Full Address" name="address" value={form.address} onChange={handleChange} />
          </Grid>
        </Section>

        <Section title="Price">
          <Grid>
            <TextField label="Price (₹)" name="price" type="number" value={form.price} onChange={handleChange} required />
            {fields.priceUnit && (
              <TextField label="Price Unit (e.g. /month)" name="priceUnit" value={form.priceUnit} onChange={handleChange} placeholder="/month" />
            )}
          </Grid>
        </Section>

        <Section title="Specifications">
          <Grid>
            <TextField label="Built-up Area" name="area" type="number" value={form.area} onChange={handleChange} />
            <TextField label="Area Unit" name="areaUnit" value={form.areaUnit} onChange={handleChange} />
            {fields.bedrooms && <TextField label="Bedrooms" name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} />}
            {fields.bathrooms && <TextField label="Bathrooms" name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} />}
            {fields.floor && <TextField label="Floor" name="floor" value={form.floor} onChange={handleChange} />}
            {fields.availableFrom && (
              <TextField label="Available From" name="availableFrom" value={form.availableFrom} onChange={handleChange} placeholder="Immediately" />
            )}
            {fields.facing && <TextField label="Facing" name="facing" value={form.facing} onChange={handleChange} placeholder="North / East..." />}
            {fields.leaseDuration && (
              <TextField label="Lease Duration" name="leaseDuration" value={form.leaseDuration} onChange={handleChange} placeholder="11 months / 1 year" />
            )}
            {fields.parking && <CheckField label="Parking Available" name="parkingAvailable" checked={form.parkingAvailable} onChange={handleChange} />}
            {fields.water && <CheckField label="Water Supply" name="waterSupply" checked={form.waterSupply} onChange={handleChange} />}
          </Grid>
        </Section>

        <Section title="Description">
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand"
          />
        </Section>

        <Section title="Owner Details (private — never shown to customers)">
          <Grid>
            <TextField label="Owner Name" name="ownerName" value={form.ownerName} onChange={handleChange} />
            <TextField label="Owner Phone Number" name="ownerPhone" value={form.ownerPhone} onChange={handleChange} />
          </Grid>
        </Section>

        <Section title={`Images (max ${MAX_IMAGES}, JPG/PNG/WEBP only — auto-compressed)`}>
          <div className="flex flex-wrap gap-3">
            {existingImages
              .filter((img) => !removedUrls.includes(img.url))
              .map((img) => (
                <div key={img.url} className="relative w-24 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <SafeImage src={img.url} alt="" width={200} loading="lazy" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExisting(img.url)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            {newFiles.map((file, i) => (
              <div key={i} className="relative w-24 h-20 rounded-lg overflow-hidden border border-gray-200">
                <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewFile(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                >
                  <FiX size={12} />
                </button>
              </div>
            ))}
            {totalImageCount < MAX_IMAGES && (
              <label className="w-24 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 cursor-pointer hover:border-brand hover:text-brand">
                <FiUploadCloud size={18} />
                <span className="text-[10px]">Add photo</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
              </label>
            )}
          </div>
        </Section>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="tap-scale w-full sm:w-auto bg-brand text-white font-semibold px-6 py-2.5 rounded-xl shadow-card disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/properties')}
            className="tap-scale w-full sm:w-auto bg-gray-100 text-ink font-semibold px-6 py-2.5 rounded-xl"
          >
            Cancel
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">{title}</p>
      {children}
    </div>
  );
}
function Grid({ children }) {
  return <div className="grid sm:grid-cols-2 gap-3">{children}</div>;
}
function TextField({ label, span, ...props }) {
  return (
    <div className={span === 2 ? 'sm:col-span-2' : ''}>
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <input
        {...props}
        className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand"
      />
    </div>
  );
}
function SelectField({ label, options, ...props }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <select
        {...props}
        className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand bg-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
function CheckField({ label, ...props }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink mt-1">
      <input type="checkbox" {...props} className="w-4 h-4 accent-[#C8202F]" />
      {label}
    </label>
  );
}
