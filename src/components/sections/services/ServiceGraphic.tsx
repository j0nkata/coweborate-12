import type { ServiceGraphicKind } from "./servicesData";

type ServiceGraphicProps = {
  kind: ServiceGraphicKind;
};

const sharedSvgProps = {
  viewBox: "0 0 420 190",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true,
  focusable: false,
} as const;

export function ServiceGraphic({ kind }: ServiceGraphicProps) {
  if (kind === "design") {
    return (
      <svg
        {...sharedSvgProps}
        className="services-showcase__graphic services-showcase__graphic--design"
      >
        <g stroke="currentColor" strokeWidth="1.5">
          <rect x="18" y="18" width="384" height="154" rx="2" />
          <path d="M18 52H402M126 52V172M294 52V172" />
          <rect x="42" y="76" width="60" height="36" />
          <rect x="42" y="130" width="60" height="18" />
          <path d="M150 78H270M150 98H238M150 118H270M150 138H222" />
          <rect x="318" y="76" width="60" height="72" />
          <path d="M318 124H378" />
        </g>
      </svg>
    );
  }

  if (kind === "development") {
    return (
      <svg
        {...sharedSvgProps}
        className="services-showcase__graphic services-showcase__graphic--development"
      >
        <g stroke="currentColor" strokeWidth="1.5">
          <rect x="20" y="72" width="64" height="46" />
          <rect x="178" y="22" width="64" height="46" />
          <rect x="178" y="122" width="64" height="46" />
          <rect x="336" y="72" width="64" height="46" />
          <path d="M84 95H124V45H178M124 95V145H178" />
          <path d="M242 45H296V95H336M242 145H296V95" />
          <path d="M194 44H226M194 146H226M352 94H384M36 94H68" />
          <rect x="116" y="87" width="16" height="16" />
          <rect x="288" y="87" width="16" height="16" />
        </g>
      </svg>
    );
  }

  if (kind === "ecommerce") {
    return (
      <svg
        {...sharedSvgProps}
        className="services-showcase__graphic services-showcase__graphic--ecommerce"
      >
        <g stroke="currentColor" strokeWidth="1.5">
          <rect x="18" y="26" width="96" height="138" />
          <path d="M18 56H114M42 82H90M42 104H90M42 126H74" />
          <path d="M114 95H166" />
          <rect x="166" y="64" width="88" height="62" />
          <path d="M184 84H236M184 104H220" />
          <path d="M254 95H306" />
          <rect x="306" y="36" width="96" height="118" />
          <path d="M306 68H402M330 94H378M330 116H366" />
          <path d="M156 87L166 95L156 103M296 87L306 95L296 103" />
        </g>
      </svg>
    );
  }

  if (kind === "performance") {
    return (
      <svg
        {...sharedSvgProps}
        className="services-showcase__graphic services-showcase__graphic--performance"
      >
        <g stroke="currentColor" strokeWidth="1.5">
          <rect x="18" y="28" width="384" height="134" />
          <path d="M18 62H402M18 96H402M18 130H402" />
          <path d="M66 28V162M146 28V162M226 28V162M306 28V162" />
          <path d="M42 138L104 116L166 124L226 86L286 94L378 50" />
          <rect x="96" y="108" width="16" height="16" />
          <rect x="218" y="78" width="16" height="16" />
          <rect x="298" y="86" width="16" height="16" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      {...sharedSvgProps}
      className="services-showcase__graphic services-showcase__graphic--growth"
    >
      <g stroke="currentColor" strokeWidth="1.5">
        <rect x="26" y="126" width="72" height="38" />
        <rect x="108" y="102" width="82" height="62" />
        <rect x="200" y="70" width="92" height="94" />
        <rect x="302" y="30" width="102" height="134" />
        <path d="M26 116H108V92H200V60H302V20H404" />
        <path d="M50 145H76M132 126H166M224 96H268M326 58H380" />
        <path d="M86 108L108 92L130 108M280 76L302 60L324 76" />
      </g>
    </svg>
  );
}
