import { HiOutlineCurrencyDollar } from 'react-icons/hi';
import type { TaxAndFees } from './useSettings';

interface TaxFeesSectionProps {
  taxAndFees: TaxAndFees;
  onTaxAndFeesChange: (tax: TaxAndFees) => void;
  onEdit: () => void;
}

export const TaxFeesSection: React.FC<TaxFeesSectionProps> = ({
  taxAndFees,
  onTaxAndFeesChange,
  onEdit,
}) => {
  return (
    <div className="bg-bg-surface rounded-lg border border-border shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <HiOutlineCurrencyDollar className="w-6 h-6 text-primary" />
        <h2 className="heading text-text-primary">Tax & Fees</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block label text-text-primary mb-2">VAT (%)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={taxAndFees.vat}
            onChange={(e) => { onEdit(); onTaxAndFeesChange({ ...taxAndFees, vat: e.target.value }); }}
            className="w-full px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block label text-text-primary mb-2">Service Fee (R)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={taxAndFees.serviceFee}
            onChange={(e) => { onEdit(); onTaxAndFeesChange({ ...taxAndFees, serviceFee: e.target.value }); }}
            className="w-full px-4 py-2 body border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
    </div>
  );
};
