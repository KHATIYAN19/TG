import { COUNTRIES, countryOf } from "./countries";

/*
  Country code + mobile number, side by side. Works with react-hook-form: pass the two `register(...)` results.

    <PhoneInput id="mobile" countryProps={form.register("countryCode")} mobileProps={form.register("mobile")}
                dial={form.watch("countryCode")} invalid={Boolean(errors.mobile)} inputClass={inputClass} />

  `inputClass(invalid)` is the page's own input style, so it matches the rest of the form.
  The select lists every country with its flag and code; the number box only takes digits.
*/
export default function PhoneInput({ id, countryProps, mobileProps, dial, invalid, inputClass, autoFocus }) {
  const c = countryOf(dial);
  const max = c?.max || 15;
  return (
    <div className="flex gap-2">
      <select
        aria-label="Country code"
        title={c ? `${c.name} (${c.dial})` : "Country code"}
        className={`${inputClass(false)} !w-[7.25rem] shrink-0 !px-2 sm:!w-[8.5rem]`}
        {...countryProps}
      >
        {COUNTRIES.map((x) => (
          <option key={x.iso} value={x.dial}>{x.dial} {x.name}</option>
        ))}
      </select>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        maxLength={max + 4 /* room for spaces the person types; they are removed */}
        placeholder={c?.min === c?.max ? `${c.min}-digit number` : "Mobile number"}
        autoFocus={autoFocus}
        aria-invalid={invalid || undefined}
        className={`${inputClass(invalid)} min-w-0 flex-1`}
        {...mobileProps}
      />
    </div>
  );
}
