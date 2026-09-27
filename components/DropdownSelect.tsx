"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export interface DropdownOption<T extends string = string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
  textLabel?: string;
}

export type OptionItem<T extends string = string> =
  | DropdownOption<T>
  | T
  | [T, string];

export interface DropdownSelectProps<T extends string = string> {
  id?: string;
  name?: string;
  value?: T;
  defaultValue?: T;
  options: readonly OptionItem<T>[] | OptionItem<T>[];
  placeholder?: string;
  onChange?: (value: T) => void;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  align?: "left" | "right" | "auto";
  size?: "small" | "medium";
  inline?: boolean;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
}

function normalizeOption<T extends string>(item: OptionItem<T>): DropdownOption<T> {
  if (typeof item === "string") {
    return { value: item as T, label: item, textLabel: item };
  }
  if (Array.isArray(item)) {
    return { value: item[0], label: item[1], textLabel: String(item[1]) };
  }
  return {
    ...item,
    textLabel:
      item.textLabel ??
      (typeof item.label === "string" ? item.label : String(item.value)),
  };
}

export function DropdownSelect<T extends string = string>({
  id: propId,
  name,
  value: controlledValue,
  defaultValue,
  options,
  placeholder,
  onChange,
  disabled = false,
  className = "",
  buttonClassName = "",
  menuClassName = "",
  align = "auto",
  size = "medium",
  inline = false,
  ariaLabel,
  ariaLabelledBy,
  ariaInvalid,
  ariaDescribedBy,
}: DropdownSelectProps<T>) {
  const generatedId = useId();
  const id = propId ?? generatedId;
  const listboxId = `${id}-listbox`;

  const normalizedOptions: DropdownOption<T>[] = options.map((opt) => normalizeOption<T>(opt));

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<T | undefined>(() => {
    if (defaultValue !== undefined) return defaultValue;
    if (normalizedOptions.length > 0 && !placeholder) {
      return normalizedOptions[0].value;
    }
    return undefined;
  });

  const selectedValue = isControlled ? controlledValue : internalValue;

  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeaheadBuffer = useRef("");
  const typeaheadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedOption = normalizedOptions.find((o) => o.value === selectedValue);
  const selectedIndex = normalizedOptions.findIndex((o) => o.value === selectedValue);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function onPointerDown(e: PointerEvent | MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen]);

  // Focus and scroll active option into view when navigating
  useEffect(() => {
    if (!isOpen || focusedIndex < 0 || !listRef.current) return;
    const optionEl = listRef.current.children[focusedIndex] as HTMLElement | undefined;
    if (optionEl) {
      optionEl.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, focusedIndex]);

  const selectOption = (opt: DropdownOption<T>) => {
    if (opt.disabled) return;
    if (!isControlled) {
      setInternalValue(opt.value);
    }
    onChange?.(opt.value);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const openMenu = (indexToFocus?: number) => {
    if (disabled) return;
    let target = indexToFocus ?? (selectedIndex >= 0 ? selectedIndex : 0);
    if (target < 0 || target >= normalizedOptions.length) target = 0;
    // ensure not disabled
    if (normalizedOptions[target]?.disabled) {
      const firstEnabled = normalizedOptions.findIndex((o) => !o.disabled);
      if (firstEnabled >= 0) target = firstEnabled;
    }
    setFocusedIndex(target);
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (e.key === "ArrowDown" || e.key === "Down") {
      e.preventDefault();
      if (!isOpen) {
        openMenu();
      } else {
        let next = focusedIndex + 1;
        while (next < normalizedOptions.length && normalizedOptions[next].disabled) {
          next++;
        }
        if (next < normalizedOptions.length) {
          setFocusedIndex(next);
        }
      }
      return;
    }

    if (e.key === "ArrowUp" || e.key === "Up") {
      e.preventDefault();
      if (!isOpen) {
        openMenu(normalizedOptions.length - 1);
      } else {
        let prev = focusedIndex - 1;
        while (prev >= 0 && normalizedOptions[prev].disabled) {
          prev--;
        }
        if (prev >= 0) {
          setFocusedIndex(prev);
        }
      }
      return;
    }

    if (e.key === "Home") {
      if (isOpen) {
        e.preventDefault();
        const first = normalizedOptions.findIndex((o) => !o.disabled);
        if (first >= 0) setFocusedIndex(first);
      }
      return;
    }

    if (e.key === "End") {
      if (isOpen) {
        e.preventDefault();
        for (let i = normalizedOptions.length - 1; i >= 0; i--) {
          if (!normalizedOptions[i].disabled) {
            setFocusedIndex(i);
            break;
          }
        }
      }
      return;
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!isOpen) {
        openMenu();
      } else if (focusedIndex >= 0 && focusedIndex < normalizedOptions.length) {
        selectOption(normalizedOptions[focusedIndex]);
      }
      return;
    }

    if (e.key === "Escape") {
      if (isOpen) {
        e.preventDefault();
        closeMenu();
      }
      return;
    }

    if (e.key === "Tab") {
      if (isOpen) {
        setIsOpen(false);
      }
      return;
    }

    // Typeahead search
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (typeaheadTimer.current) clearTimeout(typeaheadTimer.current);
      typeaheadBuffer.current += e.key.toLowerCase();
      typeaheadTimer.current = setTimeout(() => {
        typeaheadBuffer.current = "";
      }, 500);

      const searchStr = typeaheadBuffer.current;
      const matchIndex = normalizedOptions.findIndex(
        (o, idx) =>
          !o.disabled &&
          (idx > focusedIndex || searchStr.length > 1) &&
          (o.textLabel ?? "").toLowerCase().startsWith(searchStr)
      );

      const fallbackIndex =
        matchIndex >= 0
          ? matchIndex
          : normalizedOptions.findIndex(
              (o) =>
                !o.disabled &&
                (o.textLabel ?? "").toLowerCase().startsWith(searchStr)
            );

      if (fallbackIndex >= 0) {
        if (!isOpen) {
          openMenu(fallbackIndex);
        } else {
          setFocusedIndex(fallbackIndex);
        }
      }
    }
  };

  const alignClass =
    align === "right"
      ? "dropdown-select__menu--right"
      : align === "left"
      ? "dropdown-select__menu--left"
      : "dropdown-select__menu--auto";

  return (
    <div
      ref={containerRef}
      className={`dropdown-select ${inline ? "dropdown-select--inline" : ""} ${
        size === "small" ? "dropdown-select--small" : ""
      } ${className}`.trim()}
    >
      {/* Hidden input for standard HTML form submission support */}
      {name && (
        <input type="hidden" name={name} value={selectedValue ?? ""} />
      )}

      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={`dropdown-select__trigger ${buttonClassName}`.trim()}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        aria-activedescendant={
          isOpen && focusedIndex >= 0 ? `${id}-opt-${focusedIndex}` : undefined
        }
        onClick={() => {
          if (isOpen) closeMenu();
          else openMenu();
        }}
        onKeyDown={handleKeyDown}
      >
        <span className="dropdown-select__label">
          {selectedOption ? (
            selectedOption.label
          ) : placeholder ? (
            <span className="dropdown-select__placeholder">{placeholder}</span>
          ) : (
            <span className="dropdown-select__placeholder">Select…</span>
          )}
        </span>
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          className={`dropdown-select__menu ${alignClass} ${menuClassName}`.trim()}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={ariaLabelledBy ?? id}
        >
          {normalizedOptions.map((opt, idx) => {
            const isSelected = opt.value === selectedValue;
            const isFocused = idx === focusedIndex;

            return (
              <li
                key={`${opt.value}-${idx}`}
                id={`${id}-opt-${idx}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.disabled}
                data-focused={isFocused ? "true" : undefined}
                className="dropdown-select__option"
                onClick={() => selectOption(opt)}
                onMouseEnter={() => {
                  if (!opt.disabled) setFocusedIndex(idx);
                }}
              >
                <span className="dropdown-select__option-label">
                  {opt.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
