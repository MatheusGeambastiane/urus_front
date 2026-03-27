"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import {
  buildCalendarDays,
  getSummaryMonthLabel,
  isDateInRange,
  isSameDay,
  parseIsoDate,
  summaryFilterMonthOptions,
} from "@/src/features/home/utils/home";
import type { SummaryFilterMode } from "@/src/features/home/types";
import { convertDisplayDateToIso, formatDateParam, formatIsoToDisplay } from "@/src/features/shared/utils/date";

type SummaryFilterModalProps = {
  open: boolean;
  mode: SummaryFilterMode;
  onModeChange: (mode: SummaryFilterMode) => void;
  dayInput: string;
  onDayInputChange: (value: string) => void;
  monthYear: string;
  onMonthYearChange: (value: string) => void;
  monthValue: string;
  onMonthValueChange: (value: string) => void;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  rangeMonth: Date;
  years: string[];
  error: string | null;
  onClose: () => void;
  onClear: () => void;
  onApply: () => void;
  onSetCurrentMonth: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDayDate: (date: Date) => void;
  onSelectRangeDate: (date: Date) => void;
};

export function SummaryFilterModal({
  open,
  mode,
  onModeChange,
  dayInput,
  onDayInputChange,
  monthYear,
  onMonthYearChange,
  monthValue,
  onMonthValueChange,
  rangeStart,
  rangeEnd,
  rangeMonth,
  years,
  error,
  onClose,
  onClear,
  onApply,
  onSetCurrentMonth,
  onPrevMonth,
  onNextMonth,
  onSelectDayDate,
  onSelectRangeDate,
}: SummaryFilterModalProps) {
  const renderCalendarHeader = () => (
    <div className="flex items-center justify-between text-sm text-white/80">
      <button
        type="button"
        onClick={onPrevMonth}
        className="rounded-full border border-white/10 p-2 text-white/70 hover:text-white"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span>{getSummaryMonthLabel(rangeMonth)}</span>
        <span>{rangeMonth.getFullYear()}</span>
      </div>
      <button
        type="button"
        onClick={onNextMonth}
        className="rounded-full border border-white/10 p-2 text-white/70 hover:text-white"
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="Filtrar período" subtitle="Resumo">
      <div className="mb-4 flex gap-2 text-xs font-semibold">
        <button
          type="button"
          onClick={() => onModeChange("day")}
          className={`flex-1 rounded-2xl px-3 py-2 ${
            mode === "day" ? "bg-white text-black" : "bg-white/10 text-white/70"
          }`}
        >
          Por dia
        </button>
        <button
          type="button"
          onClick={() => onModeChange("month")}
          className={`flex-1 rounded-2xl px-3 py-2 ${
            mode === "month" ? "bg-white text-black" : "bg-white/10 text-white/70"
          }`}
        >
          Por mês
        </button>
        <button
          type="button"
          onClick={() => onModeChange("range")}
          className={`flex-1 rounded-2xl px-3 py-2 ${
            mode === "range" ? "bg-white text-black" : "bg-white/10 text-white/70"
          }`}
        >
          Por range
        </button>
      </div>

      {mode === "day" ? (
        <div className="space-y-4">
          <label className="block text-sm text-white/70">
            Data (dd/mm/aaaa)
            <input
              type="text"
              value={dayInput}
              onChange={(event) => onDayInputChange(event.target.value)}
              placeholder="dd/mm/aaaa"
              className="mt-1 w-full rounded-2xl border border-white/15 bg-transparent px-4 py-3 text-base outline-none focus:border-white/40"
            />
          </label>

          {renderCalendarHeader()}

          <div>
            <div className="mb-2 text-xs font-semibold text-white/60">
              {getSummaryMonthLabel(rangeMonth)} {rangeMonth.getFullYear()}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-white/40">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((label) => (
                <span key={`${rangeMonth.getMonth()}-${label}`}>{label}</span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1">
              {buildCalendarDays(rangeMonth).map(({ date, inMonth }) => {
                const selectedDayIso = convertDisplayDateToIso(dayInput);
                const selectedDayDate = selectedDayIso ? parseIsoDate(selectedDayIso) : null;
                const isSelected = isSameDay(date, selectedDayDate);
                const baseText = inMonth ? "text-white/80" : "text-white/30";
                const defaultStyle = isSelected ? "bg-white text-black font-semibold" : baseText;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                const isFuture = normalized.getTime() > today.getTime();
                const disabledStyle = isFuture ? "cursor-not-allowed text-white/20" : "";

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => onSelectDayDate(date)}
                    disabled={isFuture}
                    className={`flex h-9 w-full items-center justify-center rounded-xl text-xs transition ${
                      isFuture ? disabledStyle : defaultStyle
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : mode === "month" ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={onSetCurrentMonth}
            className="w-full rounded-2xl border border-white/15 px-4 py-2 text-sm text-white/80"
          >
            Este mês
          </button>
          <div className="flex gap-3">
            <label className="flex-1 text-sm text-white/70">
              Ano
              <select
                value={monthYear}
                onChange={(event) => onMonthYearChange(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-white/15 bg-[#050505] px-4 py-3 text-base outline-none focus:border-white/40"
              >
                <option value="">Selecione</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex-1 text-sm text-white/70">
              Mês
              <select
                value={monthValue}
                onChange={(event) => onMonthValueChange(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-white/15 bg-[#050505] px-4 py-3 text-base outline-none focus:border-white/40"
              >
                <option value="">Selecione</option>
                {summaryFilterMonthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70">
            <p>
              {rangeStart && rangeEnd
                ? `De ${formatIsoToDisplay(formatDateParam(rangeStart))} até ${formatIsoToDisplay(formatDateParam(rangeEnd))}`
                : rangeStart
                  ? `Selecionando início: ${formatIsoToDisplay(formatDateParam(rangeStart))}`
                  : "Selecione a data inicial e a data final"}
            </p>
          </div>

          {renderCalendarHeader()}

          <div>
            <div className="mb-2 text-xs font-semibold text-white/60">
              {getSummaryMonthLabel(rangeMonth)} {rangeMonth.getFullYear()}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-white/40">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((label) => (
                <span key={`${rangeMonth.getMonth()}-${label}`}>{label}</span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1">
              {buildCalendarDays(rangeMonth).map(({ date, inMonth }) => {
                const isStart = isSameDay(date, rangeStart);
                const isEnd = isSameDay(date, rangeEnd);
                const isInRange = isDateInRange(date, rangeStart, rangeEnd);
                const baseText = inMonth ? "text-white/80" : "text-white/30";
                const rangeStyle = isInRange ? "bg-white/10 text-white" : baseText;
                const selectedStyle = isStart || isEnd ? "bg-white text-black" : rangeStyle;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                const isFuture = normalized.getTime() > today.getTime();
                const disabledStyle = isFuture ? "cursor-not-allowed text-white/20" : "";

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => onSelectRangeDate(date)}
                    disabled={isFuture}
                    className={`flex h-9 w-full items-center justify-center rounded-xl text-xs transition ${
                      isFuture ? disabledStyle : selectedStyle
                    } ${isStart || isEnd ? "font-semibold" : ""}`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {error ? (
        <p className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
        <button
          type="button"
          onClick={onClear}
          className="rounded-2xl border border-white/15 px-4 py-2 text-white/80"
        >
          Limpar filtros
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/15 px-4 py-2 text-white/80"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onApply}
            className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black"
          >
            Aplicar
          </button>
        </div>
      </div>
    </Modal>
  );
}
