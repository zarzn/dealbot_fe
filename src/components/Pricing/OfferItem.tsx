const icon1 = (
  <svg
    width="25"
    height="24"
    viewBox="0 0 25 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_67_11301)">
      <path
        d="M24.5 12C24.5 5.37258 19.1274 0 12.5 0C5.87258 0 0.5 5.37258 0.5 12C0.5 18.6274 5.87258 24 12.5 24C19.1274 24 24.5 18.6274 24.5 12Z"
        fill="url(#paint0_linear_67_11301)"
        fillOpacity="0.08"
      />
      <g filter="url(#filter0_d_67_11301)">
        <path d="M12.5 9L15.5 12L12.5 15L9.5 12L12.5 9Z" fill="#EFF6FF" />
      </g>
      <path
        d="M24 12C24 5.64873 18.8513 0.5 12.5 0.5C6.14873 0.5 1 5.64873 1 12C1 18.3513 6.14873 23.5 12.5 23.5C18.8513 23.5 24 18.3513 24 12Z"
        stroke="#EFF6FF"
        strokeOpacity="0.06"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_67_11301"
        x="3.5"
        y="3"
        width="18"
        height="18"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset />
        <feGaussianBlur stdDeviation="3" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.376471 0 0 0 0 0.647059 0 0 0 0 0.980392 0 0 0 0.55 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_67_11301"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_67_11301"
          result="shape"
        />
      </filter>
      <linearGradient
        id="paint0_linear_67_11301"
        x1="12.5"
        y1="0"
        x2="12.5"
        y2="24"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#60A5FA" stopOpacity="0" />
        <stop offset="1" stopColor="#60A5FA" />
      </linearGradient>
      <clipPath id="clip0_67_11301">
        <rect width="25" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const OfferItem = ({ text }: { text: string }) => {
  return (
    <li className="flex items-center gap-5">
      {icon1}
      <span className="font-medium text-white/90">{text}</span>
    </li>
  );
};

export default OfferItem;
