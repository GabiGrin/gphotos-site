// First, let's define the IconProps interface at the top of the file
interface IconProps {
  className?: string;
  size?: number;
}

export function EditingIcon({ className }: IconProps) {
  return (
    <svg
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M7.52344 12.7083V10.2083L15.2318 2.5L17.7318 5L10.0234 12.7083H7.52344Z"
        stroke="black"
        strokeWidth="1.25"
        strokeLinecap="square"
      />
      <path
        d="M9.60681 3.125H3.35681V16.875H17.1068V10.625"
        stroke="black"
        strokeWidth="1.25"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function ImagesIcon({ className }: IconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M14.6901 14.4583L9.89848 9.66667L8.23181 11.3333L4.89848 8L1.77348 11.125M1.35681 1.125H15.1068V14.875H1.35681V1.125ZM11.3568 5.5C11.3568 6.19036 10.7971 6.75 10.1068 6.75C9.41648 6.75 8.85681 6.19036 8.85681 5.5C8.85681 4.80964 9.41648 4.25 10.1068 4.25C10.7971 4.25 11.3568 4.80964 11.3568 5.5Z"
        stroke="black"
        strokeWidth="1.25"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function ChainIcon({ className }: IconProps) {
  return (
    <svg
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5.85685 9.375H5.23185V10.625H5.85685V9.375ZM14.6069 10.625H15.2319V9.375H14.6069V10.625ZM18.7735 5.625H19.3985V5H18.7735V5.625ZM18.7735 14.375V15H19.3985V14.375H18.7735ZM13.3569 13.75H12.7319V15H13.3569V13.75ZM13.3569 5H12.7319V6.25H13.3569V5ZM1.69019 5.625V5H1.06519V5.625H1.69019ZM1.69019 14.375H1.06519V15H1.69019V14.375ZM7.10685 15H7.73185V13.75H7.10685V15ZM7.10685 6.25H7.73185V5H7.10685V6.25ZM5.85685 10.625H14.6069V9.375H5.85685V10.625ZM18.1485 5.625V14.375H19.3985V5.625H18.1485ZM18.7735 13.75H13.3569V15H18.7735V13.75ZM13.3569 6.25H18.7735V5H13.3569V6.25ZM1.06519 5.625V14.375H2.31519V5.625H1.06519ZM1.69019 15H7.10685V13.75H1.69019V15ZM7.10685 5H1.69019V6.25H7.10685V5Z"
        fill="black"
      />
    </svg>
  );
}

export function ShareIcon({ className }: IconProps) {
  return (
    <svg
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M7.71486 8.69341L11.8721 6.31782M7.71486 11.3065L11.8721 13.6821M17.0686 5.01128C17.0686 6.50366 15.8588 7.71347 14.3664 7.71347C12.874 7.71347 11.6642 6.50366 11.6642 5.01128C11.6642 3.51889 12.874 2.30908 14.3664 2.30908C15.8588 2.30908 17.0686 3.51889 17.0686 5.01128ZM17.0686 14.9886C17.0686 16.481 15.8588 17.6908 14.3664 17.6908C12.874 17.6908 11.6642 16.481 11.6642 14.9886C11.6642 13.4963 12.874 12.2864 14.3664 12.2864C15.8588 12.2864 17.0686 13.4963 17.0686 14.9886ZM7.9227 9.99994C7.9227 11.4923 6.71289 12.7021 5.22051 12.7021C3.72812 12.7021 2.51831 11.4923 2.51831 9.99994C2.51831 8.50758 3.72812 7.29775 5.22051 7.29775C6.71289 7.29775 7.9227 8.50758 7.9227 9.99994Z"
        stroke="black"
        strokeWidth="1.24717"
      />
    </svg>
  );
}

export function EmailIcon({ className }: IconProps) {
  return (
    <svg
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M17.9001 3.97197H18.5237V3.34839H17.9001V3.97197ZM17.9001 16.0279V16.6515H18.5237V16.0279H17.9001ZM2.51841 16.0279H1.89483V16.6515H2.51841V16.0279ZM2.51841 3.97197V3.34839H1.89483V3.97197H2.51841ZM10.2093 10.5493L9.92866 11.1062L10.2093 11.2475L10.4899 11.1062L10.2093 10.5493ZM3.00687 6.22201L2.44999 5.94142L1.88879 7.05519L2.44568 7.33579L3.00687 6.22201ZM17.9729 7.33579L18.5298 7.05519L17.9686 5.94142L17.4117 6.22201L17.9729 7.33579ZM17.2766 3.97197V16.0279H18.5237V3.97197H17.2766ZM17.9001 15.4043H2.51841V16.6515H17.9001V15.4043ZM3.142 16.0279V3.97197H1.89483V16.0279H3.142ZM2.51841 4.59556H17.9001V3.34839H2.51841V4.59556ZM10.4899 9.99238L3.00687 6.22201L2.44568 7.33579L9.92866 11.1062L10.4899 9.99238ZM17.4117 6.22201L9.92866 9.99238L10.4899 11.1062L17.9729 7.33579L17.4117 6.22201Z"
        fill="black"
      />
    </svg>
  );
}

export function WebsiteIcon({ className }: IconProps) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.23753 16.9078L9.08497 17.0603C7.69593 18.4493 5.44384 18.4493 4.0548 17.0603L3.74966 16.7552C2.36062 15.3661 2.36061 13.114 3.74966 11.725L6.72245 8.75222C8.1115 7.36317 10.3635 7.36317 11.7526 8.75222L12.0578 9.05731C12.639 9.63859 12.977 10.3709 13.0718 11.1279"
        stroke="black"
        strokeWidth="1.33383"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <path
        d="M8.96008 11.1279C9.05491 11.8848 9.39296 12.6171 9.97416 13.1983L10.2792 13.5034C11.6683 14.8924 13.9204 14.8924 15.3095 13.5034L18.2822 10.5307C19.6713 9.14161 19.6713 6.88952 18.2822 5.50048L17.9771 5.19535C16.5881 3.8063 14.3359 3.8063 12.9469 5.19535L12.7944 5.34791"
        stroke="black"
        strokeWidth="1.33383"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeadingIcon({ className }: IconProps) {
  return (
    <svg
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M5.02348 3.125H3.35681M5.02348 3.125H6.69014M5.02348 3.125V10M5.02348 10V16.875M5.02348 10H15.4401M5.02348 16.875H6.69014M5.02348 16.875H3.35681M15.4401 3.125H13.7735M15.4401 3.125H17.1068M15.4401 3.125V10M15.4401 10V16.875M15.4401 16.875H13.7735M15.4401 16.875H17.1068"
        stroke="black"
        strokeWidth="1.25"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function TextIcon({ className }: IconProps) {
  return (
    <svg
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M3.35681 5.20833V3.125H10.2318M10.2318 3.125H17.1068V5.20833M10.2318 3.125V16.875M10.2318 16.875H8.35681M10.2318 16.875H12.1068"
        stroke="black"
        strokeWidth="1.25"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function SortIcon({ className }: IconProps) {
  return (
    <svg
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M2.94012 6.45833L6.27346 3.125L9.60679 6.45833M10.8568 13.5417L14.1901 16.875L17.5235 13.5417M6.27346 4.16667V16.875M14.1901 3.125V16.0417"
        stroke="black"
        strokeWidth="1.25"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function ColumnsIcon({ className }: IconProps) {
  return (
    <svg
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M8.35681 3.95825H12.1068V16.0416H8.35681V3.95825Z"
        stroke="black"
        strokeWidth="1.25"
      />
      <path
        d="M2.5235 3.95825H6.2735V12.5892H2.5235V3.95825Z"
        stroke="black"
        strokeWidth="1.25"
      />
      <path
        d="M14.1901 3.95825H17.9401V10.863H14.1901V3.95825Z"
        stroke="black"
        strokeWidth="1.25"
      />
    </svg>
  );
}

export function SaveDeployIcon({ className }: IconProps) {
  return (
    <svg
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M4.87303 15.7416C3.30068 15.1044 2.19019 13.5491 2.19019 11.7315C2.19019 9.544 3.79872 7.73636 5.88504 7.45196C6.5776 5.41891 8.48604 3.95825 10.7319 3.95825C12.9777 3.95825 14.8861 5.41891 15.5787 7.45196C17.665 7.73636 19.2735 9.544 19.2735 11.7315C19.2735 13.5491 18.163 15.1044 16.5907 15.7416"
        stroke="black"
        strokeWidth="1.25"
        strokeLinecap="square"
      />
      <path
        d="M8.02344 14.1667L10.1068 16.4583L14.2734 11.875"
        stroke="black"
        strokeWidth="1.25"
        strokeLinecap="square"
      />
    </svg>
  );
}

export const AlbumIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <rect x="7" y="7" width="10" height="10" rx="2" ry="2" />
  </svg>
);

export const CheckIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
