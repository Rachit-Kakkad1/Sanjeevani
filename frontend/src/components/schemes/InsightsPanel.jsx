import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';

export default function InsightsPanel({ schemes, income }) {
  if (!schemes || schemes.length === 0) return null;

  const bestFit = schemes[0];
  const coverageRatio = income > 0 ? (bestFit.coverageAmount / income) * 100 : 100;
  
  let insightText = '';
  let insightType = 'neutral'; // positive, neutral, alert

  if (coverageRatio > 100) {
    insightText = `Based on your income of ₹${income.toLocaleString('en-IN')}, the ${bestFit.name} scheme can cover more than 100% of an average medical emergency, practically eliminating your hospital bills.`;
    insightType = 'positive';
  } else if (coverageRatio > 50) {
    insightText = `The ${bestFit.name} scheme covers a significant portion (up to ${Math.round(coverageRatio)}%) of your annual income equivalent in medical expenses, providing strong financial security.`;
    insightType = 'positive';
  } else {
    insightText = `While your income restricts some state schemes, ${bestFit.name} still provides up to ₹${bestFit.coverageAmount.toLocaleString('en-IN')} in coverage to offset major medical costs.`;
    insightType = 'neutral';
  }

  const getStyle = () => {
    switch (insightType) {
      case 'positive':
        return 'bg-green-50/50 border-green-200 text-green-800';
      case 'alert':
        return 'bg-orange-50/50 border-orange-200 text-orange-800';
      default:
        return 'bg-blue-50/50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = () => {
    switch (insightType) {
      case 'positive':
        return <TrendingUp className="text-green-500" size={24} />;
      case 'alert':
        return <AlertCircle className="text-orange-500" size={24} />;
      default:
        return <Lightbulb className="text-blue-500" size={24} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 }}
      className={`mt-8 p-6 rounded-2xl border ${getStyle()} flex items-start gap-4 shadow-sm`}
    >
      <div className="p-3 bg-white rounded-xl shadow-sm">
        {getIcon()}
      </div>
      <div>
        <h4 className="text-lg font-bold mb-1">AI Insight</h4>
        <p className="text-opacity-90 leading-relaxed font-medium">
          {insightText}
        </p>
      </div>
    </motion.div>
  );
}
