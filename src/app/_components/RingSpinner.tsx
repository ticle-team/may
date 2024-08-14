'use client';

import './RingSpinner.css';

function RingResizeSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? ''}
      width="24"
      height="24"
      stroke="currentColor"
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className="spinner_V8m1">
        <circle cx="12" cy="12" r="9.5" fill="none" strokeWidth="3"></circle>
      </g>
    </svg>
  );
}

function NormalRingSpinner({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? ''}
      fill="currentColor"
    >
      <path
        d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"
        className="spinner_P7sC"
      />
    </svg>
  );
}

function RingWithBgSpinner({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? ''}
      fill="currentColor"
    >
      <path
        d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
        opacity=".25"
      />
      <path
        d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"
        className="spinner_ajPY"
      />
    </svg>
  );
}

export default function RingSpinner({
  shape,
  ...inputs
}: {
  className?: string;
  shape?: 'normal' | 'resize' | 'with-bg';
}) {
  switch (shape) {
    case 'normal':
      return NormalRingSpinner(inputs);
    case 'with-bg':
      return RingWithBgSpinner(inputs);
    case 'resize':
      return RingResizeSpinner(inputs);
    default:
      return NormalRingSpinner(inputs);
  }
}
