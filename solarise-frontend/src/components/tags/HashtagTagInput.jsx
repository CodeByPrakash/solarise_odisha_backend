import React, { useState, useEffect, useRef } from 'react';
import StatusTag from './StatusTag';

export const PROJECT_STATUS_TAGS = [
  'new_registration', 'doc_requested', 'doc_uploaded', 'doc_verified', 'action_required',
  'action_required_bank', 'work_in_progress', 'processing_fee_paid', 'registration_no_generated',
  'master_data_pending', 'name_corrected', 'ownership_changed', 'type_converted',
  'pending_with_discom', 'security_deposit_pending', 'security_deposit_paid', 'psa_agreement_done',
  'pmsgy_done', 'loan_applied', 'loan_approved', 'loan_rejected', 'line_up_given',
  'materials_delivered', 'installation_in_progress', 'installation_done', 'installation_uploaded_pmsgy',
  'net_metering_applied', 'net_metering_rts_pending', 'net_metering_payment_pending',
  'net_metering_agreement_done', 'inspection_report_submitted', 'site_activity', 'approval_desk',
  'service_release', 'service_released', 'meter_installed', 'project_commissioned',
  'subsidy_redeemed', 'subsidy_return', 'subsidy_pending', 'subsidy_disbursed_cfa',
  'subsidy_disbursed_sfa', 'project_handover_pending', 'project_handed_over'
];

export const ACTION_STATUS_TAGS = [
  'open', 'doc_uploaded', 'in_review', 'cancelled'
];

export const ALL_TAGS = Array.from(new Set([...PROJECT_STATUS_TAGS, ...ACTION_STATUS_TAGS]));

export const HashtagTagInput = ({
  value = '',
  onChange,
  onSelectTag,
  placeholder = "Search or type # to view status tags...",
  className = '',
  singleSelect = false,
  selectedTags = [],
  onRemoveTag,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hashtagQuery, setHashtagQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (onChange) onChange(val);

    // Detect if cursor is near # or user typed #
    const hashIndex = val.lastIndexOf('#');
    if (hashIndex !== -1) {
      const query = val.slice(hashIndex + 1).toLowerCase();
      // Ensure no spaces in the hashtag query
      if (!query.includes(' ')) {
        setHashtagQuery(query);
        setShowDropdown(true);
        setSelectedIndex(0);
        return;
      }
    }
    setShowDropdown(false);
  };

  const suggestions = ALL_TAGS.filter((tag) =>
    tag.toLowerCase().includes(hashtagQuery.toLowerCase())
  );

  const handleSelectSuggestion = (tag) => {
    const hashIndex = inputValue.lastIndexOf('#');
    let newValue = '';
    if (hashIndex !== -1) {
      newValue = inputValue.slice(0, hashIndex) + `#${tag} `;
    } else {
      newValue = `#${tag} `;
    }

    setInputValue(newValue);
    if (onChange) onChange(newValue);
    if (onSelectTag) onSelectTag(tag);
    setShowDropdown(false);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === '#' && !showDropdown) {
        setShowDropdown(true);
        setHashtagQuery('');
        setSelectedIndex(0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Selected Tag Pills (if passed) */}
      {selectedTags && selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedTags.map((tag) => (
            <span key={tag} className="inline-flex items-center space-x-1">
              <StatusTag status={tag} size="sm" />
              {onRemoveTag && (
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag)}
                  className="text-gray-400 hover:text-rose-600 text-xs font-bold px-1"
                >
                  ✕
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.includes('#')) setShowDropdown(true);
          }}
          placeholder={placeholder}
          className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs font-mono"
        />
        <button
          type="button"
          onClick={() => {
            setInputValue((prev) => prev + '#');
            setHashtagQuery('');
            setShowDropdown(true);
            if (inputRef.current) inputRef.current.focus();
          }}
          className="absolute right-2 px-2 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition"
          title="Type # for status tags"
        >
          +# Tag
        </button>
      </div>

      {/* Auto-suggest Popover Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-2 space-y-1 divide-y divide-gray-50">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 flex justify-between items-center">
            <span>Tag Suggestions ({suggestions.length})</span>
            <span className="text-emerald-600">Type letters to filter</span>
          </div>

          <div className="pt-1 space-y-1">
            {suggestions.map((tag, idx) => (
              <div
                key={tag}
                onClick={() => handleSelectSuggestion(tag)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition text-xs ${selectedIndex === idx ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <div className="flex items-center space-x-2">
                  <StatusTag status={tag} showHashtag={true} size="sm" />
                  <span className="text-[11px] text-gray-500 font-mono">
                    {PROJECT_STATUS_TAGS.includes(tag) ? 'project_status' : 'action_status'}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">Select ↵</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HashtagTagInput;
