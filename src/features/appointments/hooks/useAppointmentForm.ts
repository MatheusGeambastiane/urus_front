"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { TokenRefreshService } from "@/src/features/shared/utils/auth";
import { buildDateTimeISOString, formatDateParam, formatTimeInputValue } from "@/src/features/shared/utils/date";
import { parseCurrencyInput } from "@/src/features/shared/utils/money";
import { appointmentsEndpointBase, professionalProfilesSimpleListEndpoint } from "@/src/features/appointments/services/endpoints";
import {
  createProfessionalSlot,
  getDefaultServicePrice,
  normalizeApiPaymentTypeToUi,
  normalizeAppointmentPaymentTypeForApi,
} from "@/src/features/appointments/utils/appointments";
import type {
  AppointmentItem,
  AppointmentProfessionalSlot,
  AppointmentStatus,
  ServiceAssignment,
} from "@/src/features/appointments/types";
import { productsEndpointBase, transactionsSellListEndpoint } from "@/src/features/products/services/endpoints";
import type { AddedSaleItem, ProductItem, ProductsResponse } from "@/src/features/products/types";
import type { ProfessionalSimple, ServiceOption, ServiceSimpleOption } from "@/src/features/services/types";
import { clientsEndpointBase, servicesSimpleListEndpoint, usersEndpointBase } from "@/src/features/users/services/endpoints";
import type { UserItem, UsersResponse } from "@/src/features/users/types";
import type { PaymentType } from "@/src/shared/types/payment";

type ProfessionalPickerContext = {
  slotId: string;
};

type ClientRegistrationForm = {
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
  phone: string;
  dateOfBirth: string;
};

type DayRestriction = {
  id: number;
  start_datetime: string;
  finish_datetime: string;
  is_all_day: boolean;
} | null;

type UseAppointmentFormParams = {
  accessToken: string | null;
  fetchWithAuth: TokenRefreshService["fetchWithAuth"];
  appointmentId?: number | null;
  onSuccess: (savedAppointmentId?: number) => void;
};

const DASHBOARD_TIMEZONE_OFFSET = "-03:00";

const buildDateTimeWithTimezoneOffset = (date: string, time: string) => {
  if (!date || !time) {
    return null;
  }
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  return `${date}T${normalizedTime}${DASHBOARD_TIMEZONE_OFFSET}`;
};

const buildSalesFingerprint = (sales: AddedSaleItem[]) => {
  return sales
    .map((sale) => ({
      saleId: sale.saleId ?? null,
      productId: sale.productId,
      quantity: sale.quantity,
      price: sale.price,
      paymentType: sale.paymentType,
      userId: sale.userId ?? null,
    }))
    .sort((a, b) => {
      const aKey = `${a.saleId ?? "n"}-${a.productId}-${a.quantity}-${a.price}-${a.paymentType}-${a.userId ?? "n"}`;
      const bKey = `${b.saleId ?? "n"}-${b.productId}-${b.quantity}-${b.price}-${b.paymentType}-${b.userId ?? "n"}`;
      return aKey.localeCompare(bKey);
    });
};

export function useAppointmentForm({
  accessToken,
  fetchWithAuth,
  appointmentId,
  onSuccess,
}: UseAppointmentFormParams) {
  const isEditingExistingAppointment = appointmentId !== null && appointmentId !== undefined;
  const servicePricePrefillRef = useRef(false);
  const originalSalesSnapshotRef = useRef<AddedSaleItem[]>([]);

  const [loadingExistingAppointment, setLoadingExistingAppointment] = useState(false);
  const [loadingExistingAppointmentError, setLoadingExistingAppointmentError] = useState<string | null>(null);

  const [createAppointmentError, setCreateAppointmentError] = useState<string | null>(null);
  const [isSavingAppointment, setIsSavingAppointment] = useState(false);
  const [selectedAppointmentStatus, setSelectedAppointmentStatus] = useState<AppointmentStatus>("agendado");
  const [selectedClient, setSelectedClient] = useState<UserItem | null>(null);
  const [appointmentProfessionals, setAppointmentProfessionals] = useState<AppointmentProfessionalSlot[]>([
    createProfessionalSlot(),
  ]);
  const [serviceAssignments, setServiceAssignments] = useState<Record<number, ServiceAssignment>>({});
  const [selectedAppointmentServices, setSelectedAppointmentServices] = useState<ServiceSimpleOption[]>([]);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [priceManuallyEdited, setPriceManuallyEdited] = useState(false);
  const [discountInput, setDiscountInput] = useState("0");
  const [tipsInput, setTipsInput] = useState("0.00");
  const [appointmentObservations, setAppointmentObservations] = useState("");
  const [appointmentDateInput, setAppointmentDateInput] = useState(() => formatDateParam(new Date()));
  const [appointmentTimeInput, setAppointmentTimeInput] = useState(() => formatTimeInputValue(new Date()));
  const [dayRestriction, setDayRestriction] = useState<DayRestriction>(null);

  const [showClientPickerModal, setShowClientPickerModal] = useState(false);
  const [clientSearchInput, setClientSearchInput] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [clientPickerResults, setClientPickerResults] = useState<UserItem[]>([]);
  const [clientPickerLoading, setClientPickerLoading] = useState(false);
  const [clientPickerError, setClientPickerError] = useState<string | null>(null);

  const [showClientRegistrationModal, setShowClientRegistrationModal] = useState(false);
  const [clientRegistrationForm, setClientRegistrationForm] = useState<ClientRegistrationForm>({
    firstName: "",
    lastName: "",
    email: "",
    cpf: "",
    phone: "",
    dateOfBirth: "",
  });
  const [clientRegistrationSubmitting, setClientRegistrationSubmitting] = useState(false);
  const [clientRegistrationError, setClientRegistrationError] = useState<string | null>(null);
  const [showClientEmailSuggestions, setShowClientEmailSuggestions] = useState(false);

  const [showServicesPickerModal, setShowServicesPickerModal] = useState(false);
  const [servicesPickerSearchInput, setServicesPickerSearchInput] = useState("");
  const [servicesPickerSearchTerm, setServicesPickerSearchTerm] = useState("");
  const [servicesPickerResults, setServicesPickerResults] = useState<ServiceSimpleOption[]>([]);
  const [servicesPickerLoading, setServicesPickerLoading] = useState(false);
  const [servicesPickerError, setServicesPickerError] = useState<string | null>(null);
  const [servicesPickerTempSelection, setServicesPickerTempSelection] = useState<ServiceSimpleOption[]>([]);

  const [professionalPickerContext, setProfessionalPickerContext] = useState<ProfessionalPickerContext | null>(null);
  const [showProfessionalPickerModal, setShowProfessionalPickerModal] = useState(false);
  const [professionalSearchInput, setProfessionalSearchInput] = useState("");
  const [professionalSearchTerm, setProfessionalSearchTerm] = useState("");
  const [professionalPickerResults, setProfessionalPickerResults] = useState<ServiceOption[]>([]);
  const [professionalPickerLoading, setProfessionalPickerLoading] = useState(false);
  const [professionalPickerError, setProfessionalPickerError] = useState<string | null>(null);

  const [showPaymentTypeModal, setShowPaymentTypeModal] = useState(false);

  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [saleProductsList, setSaleProductsList] = useState<ProductItem[]>([]);
  const [saleProductsLoading, setSaleProductsLoading] = useState(false);
  const [saleProductsError, setSaleProductsError] = useState<string | null>(null);
  const [saleProductsSearchInput, setSaleProductsSearchInput] = useState("");
  const [saleProductsSearchTerm, setSaleProductsSearchTerm] = useState("");
  const [saleProfessionalsList, setSaleProfessionalsList] = useState<{ userId: number; name: string }[]>([]);
  const [saleProfessionalId, setSaleProfessionalId] = useState<number | null>(null);
  const [selectedSaleProductId, setSelectedSaleProductId] = useState<number | null>(null);
  const [saleQuantityInput, setSaleQuantityInput] = useState("1");
  const [salePriceInput, setSalePriceInput] = useState("");
  const [salePaymentSelect, setSalePaymentSelect] = useState<PaymentType | "">("");
  const [isAddingSaleProduct, setIsAddingSaleProduct] = useState(false);
  const [addedSales, setAddedSales] = useState<AddedSaleItem[]>([]);
  const [saleEditingIndex, setSaleEditingIndex] = useState<number | null>(null);
  const [saleDeletingId, setSaleDeletingId] = useState<number | null>(null);

  const resetAppointmentForm = useCallback(() => {
    servicePricePrefillRef.current = false;
    originalSalesSnapshotRef.current = [];
    setAppointmentDateInput(formatDateParam(new Date()));
    setAppointmentTimeInput(formatTimeInputValue(new Date()));
    setSelectedAppointmentStatus("agendado");
    setSelectedClient(null);
    setAppointmentProfessionals([createProfessionalSlot()]);
    setServiceAssignments({});
    setSelectedAppointmentServices([]);
    setSelectedPaymentType(null);
    setPriceInput("");
    setPriceManuallyEdited(false);
    setDiscountInput("0");
    setTipsInput("0.00");
    setAppointmentObservations("");
    setCreateAppointmentError(null);
    setAddedSales([]);
    setSaleModalOpen(false);
    setSelectedSaleProductId(null);
    setSaleQuantityInput("1");
    setSalePriceInput("");
    setSalePaymentSelect("");
    setSaleEditingIndex(null);
    setSaleProfessionalId(null);
    setShowClientPickerModal(false);
    setShowServicesPickerModal(false);
    setShowProfessionalPickerModal(false);
    setShowClientRegistrationModal(false);
    setShowPaymentTypeModal(false);
  }, []);

  const appointmentServicesSubtotal = useMemo(() => {
    return selectedAppointmentServices.reduce((sum, service) => {
      const assignmentPrice = serviceAssignments[service.id]?.price;
      const rawPrice = assignmentPrice ?? service.price ?? "0";
      const value = parseCurrencyInput(rawPrice);
      return sum + (Number.isNaN(value) ? 0 : value);
    }, 0);
  }, [selectedAppointmentServices, serviceAssignments]);

  const filledAppointmentProfessionals = useMemo(() => {
    return appointmentProfessionals.filter((slot) => slot.professional !== null);
  }, [appointmentProfessionals]);

  const hasMultipleProfessionals = filledAppointmentProfessionals.length > 1;

  const normalizedDiscount = useMemo(() => {
    const parsed = Number(discountInput);
    if (Number.isNaN(parsed)) {
      return 0;
    }
    if (parsed < 0) {
      return 0;
    }
    if (parsed > 100) {
      return 100;
    }
    return parsed;
  }, [discountInput]);

  const appointmentPriceValue = useMemo(() => parseCurrencyInput(priceInput), [priceInput]);
  const appointmentTipsValue = useMemo(() => parseCurrencyInput(tipsInput), [tipsInput]);

  const servicesGrossTotal = useMemo(() => {
    if (selectedAppointmentServices.length === 0) {
      return 0;
    }
    return selectedAppointmentServices.reduce((sum, service) => {
      const assignment = serviceAssignments[service.id];
      const rawPrice = assignment?.price ?? service.price ?? "0";
      const value = parseCurrencyInput(rawPrice);
      return sum + (Number.isNaN(value) ? 0 : value);
    }, 0);
  }, [selectedAppointmentServices, serviceAssignments]);

  const servicesDiscountAmount = useMemo(
    () => (servicesGrossTotal * normalizedDiscount) / 100,
    [servicesGrossTotal, normalizedDiscount],
  );

  const servicesTotalAfterDiscount = useMemo(
    () => Math.max(servicesGrossTotal - servicesDiscountAmount, 0),
    [servicesGrossTotal, servicesDiscountAmount],
  );

  const addedSalesTotal = useMemo(() => {
    return addedSales.reduce((sum, sale) => {
      const value = parseCurrencyInput(sale.price);
      return sum + (Number.isNaN(value) ? 0 : value);
    }, 0);
  }, [addedSales]);

  const appointmentServiceTipsTotal = useMemo(() => {
    return selectedAppointmentServices.reduce((sum, service) => {
      const value = parseCurrencyInput(serviceAssignments[service.id]?.tips ?? "0");
      return sum + (Number.isNaN(value) ? 0 : value);
    }, 0);
  }, [selectedAppointmentServices, serviceAssignments]);

  const appointmentTipsTotal = useMemo(
    () => (hasMultipleProfessionals ? appointmentServiceTipsTotal : appointmentTipsValue),
    [appointmentServiceTipsTotal, appointmentTipsValue, hasMultipleProfessionals],
  );

  const appointmentGrandTotal = useMemo(() => {
    return servicesTotalAfterDiscount + appointmentTipsTotal + addedSalesTotal;
  }, [servicesTotalAfterDiscount, appointmentTipsTotal, addedSalesTotal]);

  const currentProfessionalPickerSlot = useMemo(() => {
    if (!professionalPickerContext) {
      return null;
    }
    return appointmentProfessionals.find((slot) => slot.id === professionalPickerContext.slotId) ?? null;
  }, [appointmentProfessionals, professionalPickerContext]);

  useEffect(() => {
    if (selectedAppointmentServices.length === 0) {
      setPriceInput("");
      setPriceManuallyEdited(false);
      return;
    }
    if (priceManuallyEdited) {
      return;
    }
    const total = selectedAppointmentServices.reduce((sum, service) => {
      const assignmentPrice = serviceAssignments[service.id]?.price;
      const rawPrice = assignmentPrice ?? service.price ?? "0";
      const value = parseCurrencyInput(rawPrice);
      return sum + (Number.isNaN(value) ? 0 : value);
    }, 0);
    setPriceInput(total.toFixed(2));
  }, [priceManuallyEdited, selectedAppointmentServices, serviceAssignments]);

  useEffect(() => {
    if (!accessToken || !appointmentDateInput) {
      return;
    }
    const controller = new AbortController();

    const fetchDayRestriction = async () => {
      try {
        const url = new URL(appointmentsEndpointBase);
        url.searchParams.set("date", appointmentDateInput);
        const response = await fetchWithAuth(url.toString(), {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar as restrições do dia.");
        }

        const data = (await response.json()) as { day_restriction?: DayRestriction };
        setDayRestriction(data.day_restriction ?? null);
      } catch {
        if (!controller.signal.aborted) {
          setDayRestriction(null);
        }
      }
    };

    void fetchDayRestriction();
    return () => controller.abort();
  }, [accessToken, appointmentDateInput, fetchWithAuth]);

  useEffect(() => {
    if (!showClientPickerModal || !accessToken) {
      return;
    }
    const controller = new AbortController();
    const fetchClients = async () => {
      setClientPickerLoading(true);
      setClientPickerError(null);
      try {
        const url = new URL(usersEndpointBase);
        url.searchParams.set("page_size", "10");
        if (clientSearchTerm) {
          url.searchParams.set("search", clientSearchTerm);
        }
        const response = await fetchWithAuth(url.toString(), {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Não foi possível carregar clientes.");
        }
        const data: UsersResponse = await response.json();
        setClientPickerResults(Array.isArray(data.results) ? data.results : []);
      } catch (err) {
        if (!controller.signal.aborted) {
          setClientPickerError(err instanceof Error ? err.message : "Erro inesperado ao buscar clientes.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setClientPickerLoading(false);
        }
      }
    };
    void fetchClients();
    return () => controller.abort();
  }, [accessToken, clientSearchTerm, fetchWithAuth, showClientPickerModal]);

  useEffect(() => {
    if (!showServicesPickerModal || !accessToken) {
      return;
    }
    const controller = new AbortController();
    const fetchServices = async () => {
      setServicesPickerLoading(true);
      setServicesPickerError(null);
      try {
        const url = new URL(servicesSimpleListEndpoint);
        if (servicesPickerSearchTerm) {
          url.searchParams.set("search", servicesPickerSearchTerm);
        }
        const response = await fetchWithAuth(url.toString(), {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Não foi possível carregar serviços.");
        }
        const data: ServiceSimpleOption[] = await response.json();
        setServicesPickerResults(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!controller.signal.aborted) {
          setServicesPickerError(err instanceof Error ? err.message : "Erro inesperado ao buscar serviços.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setServicesPickerLoading(false);
        }
      }
    };
    void fetchServices();
    return () => controller.abort();
  }, [accessToken, fetchWithAuth, servicesPickerSearchTerm, showServicesPickerModal]);

  useEffect(() => {
    if (!isEditingExistingAppointment || !appointmentId || !accessToken) {
      return;
    }
    if (servicePricePrefillRef.current) {
      return;
    }
    if (selectedAppointmentServices.length === 0) {
      servicePricePrefillRef.current = true;
      return;
    }
    const needsPriceLookup = selectedAppointmentServices.some((service) => {
      const assignmentPrice = serviceAssignments[service.id]?.price;
      const rawPrice = assignmentPrice ?? service.price ?? "0";
      return parseCurrencyInput(rawPrice) <= 0;
    });
    if (!needsPriceLookup) {
      servicePricePrefillRef.current = true;
      return;
    }
    const controller = new AbortController();
    const fetchServicePrices = async () => {
      try {
        const response = await fetchWithAuth(servicesSimpleListEndpoint, {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Não foi possível carregar os serviços.");
        }
        const data: ServiceSimpleOption[] = await response.json();
        const priceMap = new Map((Array.isArray(data) ? data : []).map((service) => [service.id, service.price]));
        setSelectedAppointmentServices((prev) =>
          prev.map((service) => ({
            ...service,
            price:
              service.price && parseCurrencyInput(service.price) > 0
                ? service.price
                : priceMap.get(service.id) ?? service.price ?? "0",
          })),
        );
        setServiceAssignments((prev) => {
          const updated: Record<number, ServiceAssignment> = { ...prev };
          Object.entries(updated).forEach(([key, assignment]) => {
            const serviceId = Number(key);
            const fallbackPrice = priceMap.get(serviceId);
            if (parseCurrencyInput(assignment.price) <= 0 && fallbackPrice) {
              updated[serviceId] = { ...assignment, price: fallbackPrice };
            }
          });
          return updated;
        });
      } catch {
        // noop
      } finally {
        servicePricePrefillRef.current = true;
      }
    };
    void fetchServicePrices();
    return () => controller.abort();
  }, [
    accessToken,
    appointmentId,
    fetchWithAuth,
    isEditingExistingAppointment,
    selectedAppointmentServices,
    serviceAssignments,
  ]);

  useEffect(() => {
    if (!showProfessionalPickerModal || !accessToken) {
      return;
    }
    const controller = new AbortController();
    const fetchProfessionalsForPicker = async () => {
      setProfessionalPickerLoading(true);
      setProfessionalPickerError(null);
      try {
        const url = new URL(professionalProfilesSimpleListEndpoint);
        if (professionalSearchTerm) {
          url.searchParams.set("search", professionalSearchTerm);
        }
        const response = await fetchWithAuth(url.toString(), {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Não foi possível carregar profissionais.");
        }
        const data: ProfessionalSimple[] = await response.json();
        const mapped = Array.isArray(data)
          ? data.map((item) => ({ id: item.id, name: item.user_name }))
          : [];
        setProfessionalPickerResults(mapped);
      } catch (err) {
        if (!controller.signal.aborted) {
          setProfessionalPickerError(
            err instanceof Error ? err.message : "Erro inesperado ao buscar profissionais.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setProfessionalPickerLoading(false);
        }
      }
    };
    void fetchProfessionalsForPicker();
    return () => controller.abort();
  }, [accessToken, fetchWithAuth, professionalSearchTerm, showProfessionalPickerModal]);

  useEffect(() => {
    if (!saleModalOpen || !accessToken) {
      return;
    }
    const controller = new AbortController();
    const fetchSaleProducts = async () => {
      setSaleProductsLoading(true);
      setSaleProductsError(null);
      try {
        const url = new URL(productsEndpointBase);
        url.searchParams.set("use_type", "venda");
        url.searchParams.set("page_size", "100");
        if (saleProductsSearchTerm) {
          url.searchParams.set("search", saleProductsSearchTerm);
        }
        const response = await fetchWithAuth(url.toString(), {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Não foi possível carregar produtos para venda.");
        }
        const data: ProductsResponse = await response.json();
        setSaleProductsList(Array.isArray(data.results) ? data.results : []);
      } catch (err) {
        if (!controller.signal.aborted) {
          setSaleProductsError(
            err instanceof Error ? err.message : "Erro inesperado ao carregar produtos para venda.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setSaleProductsLoading(false);
        }
      }
    };
    void fetchSaleProducts();
    return () => controller.abort();
  }, [accessToken, fetchWithAuth, saleModalOpen, saleProductsSearchTerm]);

  useEffect(() => {
    if (!saleModalOpen || !accessToken) {
      return;
    }
    const controller = new AbortController();
    const fetchSaleProfessionals = async () => {
      try {
        const response = await fetchWithAuth(professionalProfilesSimpleListEndpoint, {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Não foi possível carregar profissionais.");
        }
        const data: ProfessionalSimple[] = await response.json();
        const mapped = Array.isArray(data)
          ? data
              .map((item) => ({
                userId: item.user_id ?? item.id,
                name: item.user_name,
              }))
              .filter((item) => Number.isFinite(item.userId))
          : [];
        setSaleProfessionalsList(mapped);
      } catch {
        if (!controller.signal.aborted) {
          setSaleProfessionalsList([]);
        }
      }
    };
    void fetchSaleProfessionals();
    return () => controller.abort();
  }, [accessToken, fetchWithAuth, saleModalOpen]);

  useEffect(() => {
    if (!showClientPickerModal) {
      setClientSearchInput("");
      setClientSearchTerm("");
      setClientPickerResults([]);
      setClientPickerError(null);
      setClientPickerLoading(false);
    }
  }, [showClientPickerModal]);

  useEffect(() => {
    if (!showServicesPickerModal) {
      setServicesPickerSearchInput("");
      setServicesPickerSearchTerm("");
      setServicesPickerResults([]);
      setServicesPickerError(null);
      setServicesPickerLoading(false);
    }
  }, [showServicesPickerModal]);

  useEffect(() => {
    if (!showProfessionalPickerModal) {
      setProfessionalSearchInput("");
      setProfessionalSearchTerm("");
      setProfessionalPickerResults([]);
      setProfessionalPickerError(null);
      setProfessionalPickerLoading(false);
    }
  }, [showProfessionalPickerModal]);

  useEffect(() => {
    if (!saleModalOpen) {
      setSelectedSaleProductId(null);
      setSaleQuantityInput("1");
      setSalePriceInput("");
      setSalePaymentSelect("");
      setSaleProfessionalId(null);
      setSaleEditingIndex(null);
    }
  }, [saleModalOpen]);

  useEffect(() => {
    if (!isEditingExistingAppointment || !appointmentId || !accessToken) {
      return;
    }
    const controller = new AbortController();

    const loadAppointmentForEdit = async () => {
      setLoadingExistingAppointment(true);
      setLoadingExistingAppointmentError(null);
      try {
        const response = await fetchWithAuth(`${appointmentsEndpointBase}${appointmentId}/`, {
          credentials: "include",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Não foi possível carregar o agendamento para edição.");
        }
        const detail: AppointmentItem = await response.json();
        const detailDate = detail.date_time ? new Date(detail.date_time) : new Date();
        const professionalsMap = new Map<number, { id: string; professional: ServiceOption }>();

        if (Array.isArray(detail.professional_services) && detail.professional_services.length > 0) {
          detail.professional_services.forEach((item) => {
            if (!professionalsMap.has(item.professional)) {
              professionalsMap.set(item.professional, {
                id: createProfessionalSlot().id,
                professional: {
                  id: item.professional,
                  name: item.professional_name ?? `Profissional #${item.professional}`,
                },
              });
            }
          });
        } else if (detail.professional && detail.professional_name) {
          professionalsMap.set(detail.professional, {
            id: createProfessionalSlot().id,
            professional: {
              id: detail.professional,
              name: detail.professional_name,
            },
          });
        }

        const appointmentSlots =
          Array.from(professionalsMap.values()).length > 0
            ? Array.from(professionalsMap.values())
            : [createProfessionalSlot()];

        const nextServices = detail.services.map((service) => {
          const professionalService = detail.professional_services?.find((item) => item.service === service.id);
          return {
            id: service.id,
            name: service.name,
            price: professionalService?.price_paid ?? "0",
          };
        });

        const nextAssignments = nextServices.reduce<Record<number, ServiceAssignment>>((acc, service) => {
          const professionalService = detail.professional_services?.find((item) => item.service === service.id);
          const slotId = professionalService
            ? professionalsMap.get(professionalService.professional)?.id ?? null
            : appointmentSlots[0]?.id ?? null;
          acc[service.id] = {
            professionalSlotId: slotId,
            price: professionalService?.price_paid ?? service.price ?? "0",
            tips: professionalService?.tips ?? "0.00",
          };
          return acc;
        }, {});

        const nextSales =
          detail.sells?.map((sale) => ({
            saleId: sale.id,
            productId: sale.product ?? 0,
            productName: sale.product_name ?? "Produto",
            price: sale.price ?? "0",
            quantity: sale.quantity ?? 1,
            paymentType: normalizeApiPaymentTypeToUi(sale.transaction_payment) ?? "pix",
            userId: sale.user ?? null,
          })) ?? [];

        resetAppointmentForm();
        if (!Number.isNaN(detailDate.getTime())) {
          setAppointmentDateInput(formatDateParam(detailDate));
          setAppointmentTimeInput(formatTimeInputValue(detailDate));
        }
        setSelectedAppointmentStatus(detail.status as AppointmentStatus);
        setSelectedClient(
          detail.client
            ? {
                id: detail.client,
                first_name: detail.client_name ?? "",
                last_name: "",
                role: "client",
                email: "",
                phone: "",
                profile_pic: null,
                professional_profile: null,
              }
            : null,
        );
        setAppointmentProfessionals(appointmentSlots);
        setSelectedAppointmentServices(nextServices);
        setServicesPickerTempSelection(nextServices);
        setServiceAssignments(nextAssignments);
        setSelectedPaymentType(normalizeApiPaymentTypeToUi(detail.payment_type));
        setDiscountInput(String(detail.discount ?? 0));
        setTipsInput(detail.tips ?? "0.00");
        setAppointmentObservations(detail.observations ?? "");
        setAddedSales(nextSales);
        originalSalesSnapshotRef.current = nextSales;
        setPriceInput(detail.price_paid ?? "0");
        setPriceManuallyEdited(true);
      } catch (err) {
        if (!controller.signal.aborted) {
          setLoadingExistingAppointmentError(
            err instanceof Error ? err.message : "Não foi possível carregar o agendamento para edição.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingExistingAppointment(false);
        }
      }
    };

    void loadAppointmentForEdit();
    return () => controller.abort();
  }, [accessToken, appointmentId, fetchWithAuth, isEditingExistingAppointment, resetAppointmentForm]);

  const isDateTimeWithinDayRestriction = useCallback(
    (date: string, time: string) => {
      if (!dayRestriction || !date || !time) {
        return false;
      }
      const appointmentDateTimeWithTimezone = buildDateTimeWithTimezoneOffset(date, time);
      if (!appointmentDateTimeWithTimezone) {
        return false;
      }
      const appointmentDateTime = new Date(appointmentDateTimeWithTimezone);
      const restrictionStart = new Date(dayRestriction.start_datetime);
      const restrictionFinish = new Date(dayRestriction.finish_datetime);
      if (
        Number.isNaN(appointmentDateTime.getTime()) ||
        Number.isNaN(restrictionStart.getTime()) ||
        Number.isNaN(restrictionFinish.getTime())
      ) {
        return false;
      }
      return appointmentDateTime >= restrictionStart && appointmentDateTime <= restrictionFinish;
    },
    [dayRestriction],
  );

  const handleAppointmentTimeChange = (value: string) => {
    if (isDateTimeWithinDayRestriction(appointmentDateInput, value)) {
      setCreateAppointmentError("O horário selecionado está dentro da restrição deste dia.");
      return;
    }
    setCreateAppointmentError(null);
    setAppointmentTimeInput(value);
  };

  const handleClientPickerSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setClientSearchTerm(clientSearchInput.trim());
  };

  const handleServicePickerSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServicesPickerSearchTerm(servicesPickerSearchInput.trim());
  };

  const handleProfessionalPickerSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfessionalSearchTerm(professionalSearchInput.trim());
  };

  const handleSelectClient = (client: UserItem) => {
    setSelectedClient(client);
    setShowClientPickerModal(false);
    setCreateAppointmentError(null);
  };

  const handleClearSelectedClient = () => {
    setSelectedClient(null);
  };

  const handleOpenClientRegistrationModal = () => {
    setClientRegistrationForm({
      firstName: "",
      lastName: "",
      email: "",
      cpf: "",
      phone: "",
      dateOfBirth: "",
    });
    setClientRegistrationError(null);
    setShowClientRegistrationModal(true);
  };

  const handleClientRegistrationInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setClientRegistrationForm((previous) => ({
      ...previous,
      [name]: value,
    }));
    if (name === "email") {
      setShowClientEmailSuggestions(Boolean(value.trim()));
    }
  };

  const handleSelectClientEmailSuggestion = (email: string) => {
    setClientRegistrationForm((previous) => ({
      ...previous,
      email,
    }));
    setShowClientEmailSuggestions(false);
  };

  const handleSubmitClientRegistration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) {
      setClientRegistrationError("Sessão expirada. Faça login novamente.");
      return;
    }
    setClientRegistrationError(null);
    const trimmedFirstName = clientRegistrationForm.firstName.trim();
    const trimmedLastName = clientRegistrationForm.lastName.trim();
    const trimmedEmail = clientRegistrationForm.email.trim();
    const trimmedCpf = clientRegistrationForm.cpf.trim();
    const trimmedPhone = clientRegistrationForm.phone.trim();
    const birthDate = clientRegistrationForm.dateOfBirth;

    if (!trimmedFirstName || !trimmedLastName || !trimmedEmail || !trimmedPhone) {
      setClientRegistrationError("Preencha todos os campos obrigatórios.");
      return;
    }

    setClientRegistrationSubmitting(true);
    try {
      const response = await fetchWithAuth(clientsEndpointBase, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          first_name: trimmedFirstName,
          last_name: trimmedLastName,
          email: trimmedEmail,
          cpf: trimmedCpf || null,
          phone: trimmedPhone,
          date_of_birth: birthDate || null,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Não foi possível registrar o cliente.";
        try {
          const data = await response.json();
          if (data?.detail) {
            errorMessage = data.detail;
          }
        } catch {
          // noop
        }
        throw new Error(errorMessage);
      }

      const createdClient: UserItem = await response.json();
      setSelectedClient(createdClient);
      setShowClientRegistrationModal(false);
      setClientRegistrationForm({
        firstName: "",
        lastName: "",
        email: "",
        cpf: "",
        phone: "",
        dateOfBirth: "",
      });
    } catch (err) {
      setClientRegistrationError(
        err instanceof Error ? err.message : "Erro inesperado ao registrar o cliente.",
      );
    } finally {
      setClientRegistrationSubmitting(false);
    }
  };

  const handleOpenServicesPickerModal = () => {
    setServicesPickerTempSelection(selectedAppointmentServices);
    setShowServicesPickerModal(true);
  };

  const handleCancelServicesPicker = () => {
    setServicesPickerTempSelection(selectedAppointmentServices);
    setShowServicesPickerModal(false);
  };

  const handleToggleServiceInModal = (service: ServiceSimpleOption) => {
    setServicesPickerTempSelection((previous) => {
      const exists = previous.some((item) => item.id === service.id);
      if (exists) {
        return previous.filter((item) => item.id !== service.id);
      }
      return [...previous, service];
    });
  };

  const handleConfirmServicesPicker = () => {
    setSelectedAppointmentServices(servicesPickerTempSelection);
    setServiceAssignments((prev) => {
      const next: Record<number, ServiceAssignment> = {};
      servicesPickerTempSelection.forEach((service) => {
        next[service.id] =
          prev[service.id] ??
          {
            professionalSlotId: appointmentProfessionals[0]?.id ?? null,
            price: getDefaultServicePrice(service.price),
            tips: "0.00",
          };
      });
      return next;
    });
    setPriceManuallyEdited(false);
    setShowServicesPickerModal(false);
  };

  const handleRemoveAppointmentService = (serviceId: number) => {
    setSelectedAppointmentServices((previous) => previous.filter((service) => service.id !== serviceId));
    setServicesPickerTempSelection((previous) => previous.filter((service) => service.id !== serviceId));
    setServiceAssignments((prev) => {
      const updated = { ...prev };
      delete updated[serviceId];
      return updated;
    });
    setPriceManuallyEdited(false);
  };

  const handleAddProfessionalSlot = () => {
    setAppointmentProfessionals((previous) => [...previous, createProfessionalSlot()]);
  };

  const handleRemoveProfessionalSlot = (slotId: string) => {
    setAppointmentProfessionals((previous) => {
      if (previous.length === 1) {
        return previous;
      }
      const filtered = previous.filter((slot) => slot.id !== slotId);
      if (filtered.length === previous.length) {
        return previous;
      }
      setServiceAssignments((prevAssignments) => {
        const fallbackSlotId = filtered[0]?.id ?? null;
        const updatedEntries: Record<number, ServiceAssignment> = {};
        Object.entries(prevAssignments).forEach(([key, assignment]) => {
          updatedEntries[Number(key)] = {
            ...assignment,
            professionalSlotId:
              assignment.professionalSlotId === slotId ? fallbackSlotId : assignment.professionalSlotId,
          };
        });
        return updatedEntries;
      });
      if (professionalPickerContext?.slotId === slotId) {
        setProfessionalPickerContext(null);
        setShowProfessionalPickerModal(false);
      }
      return filtered;
    });
  };

  const handleOpenProfessionalPicker = (slotId: string) => {
    setProfessionalPickerContext({ slotId });
    setProfessionalSearchInput("");
    setProfessionalSearchTerm("");
    setShowProfessionalPickerModal(true);
  };

  const handleCloseProfessionalPicker = () => {
    setProfessionalPickerContext(null);
    setShowProfessionalPickerModal(false);
  };

  const handleServiceAssignmentProfessionalChange = (serviceId: number, slotId: string | null) => {
    setServiceAssignments((prev) => ({
      ...prev,
      [serviceId]: {
        professionalSlotId: slotId,
        price: prev[serviceId]?.price ?? "0.00",
        tips: prev[serviceId]?.tips ?? "0.00",
      },
    }));
  };

  const handleServiceAssignmentPriceChange = (serviceId: number, event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setServiceAssignments((prev) => ({
      ...prev,
      [serviceId]: {
        professionalSlotId: prev[serviceId]?.professionalSlotId ?? appointmentProfessionals[0]?.id ?? null,
        price: value,
        tips: prev[serviceId]?.tips ?? "0.00",
      },
    }));
  };

  const handleTipsInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTipsInput(event.target.value);
  };

  const handleServiceAssignmentTipsChange = (serviceId: number, event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setServiceAssignments((prev) => ({
      ...prev,
      [serviceId]: {
        professionalSlotId: prev[serviceId]?.professionalSlotId ?? appointmentProfessionals[0]?.id ?? null,
        price: prev[serviceId]?.price ?? "0.00",
        tips: value,
      },
    }));
  };

  const handleSelectProfessionalForAppointment = (professional: ServiceOption) => {
    if (!professionalPickerContext) {
      handleCloseProfessionalPicker();
      return;
    }
    setAppointmentProfessionals((previous) =>
      previous.map((slot) =>
        slot.id === professionalPickerContext.slotId ? { ...slot, professional } : slot,
      ),
    );
    handleCloseProfessionalPicker();
    setCreateAppointmentError(null);
  };

  const handleClearProfessionalSelection = (slotId: string) => {
    setAppointmentProfessionals((previous) =>
      previous.map((slot) => (slot.id === slotId ? { ...slot, professional: null } : slot)),
    );
  };

  const handleSelectPaymentOption = (payment: PaymentType) => {
    setSelectedPaymentType(payment);
    setShowPaymentTypeModal(false);
  };

  const handlePriceInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPriceInput(event.target.value);
    setPriceManuallyEdited(true);
  };

  const handleDiscountInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === "") {
      setDiscountInput("0");
      return;
    }
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return;
    }
    if (numeric > 100) {
      setDiscountInput("100");
      return;
    }
    if (numeric < 0) {
      setDiscountInput("0");
      return;
    }
    setDiscountInput(value);
  };

  const handleResetPriceFromServices = () => {
    setPriceManuallyEdited(false);
    setPriceInput(appointmentServicesSubtotal.toFixed(2));
    setServiceAssignments((prev) => {
      const updated: Record<number, ServiceAssignment> = { ...prev };
      selectedAppointmentServices.forEach((service) => {
        updated[service.id] = {
          professionalSlotId: prev[service.id]?.professionalSlotId ?? appointmentProfessionals[0]?.id ?? null,
          price: getDefaultServicePrice(service.price),
          tips: prev[service.id]?.tips ?? "0.00",
        };
      });
      return updated;
    });
  };

  const handleOpenSaleModal = () => {
    setSaleEditingIndex(null);
    setSelectedSaleProductId(null);
    setSaleQuantityInput("1");
    setSalePriceInput("");
    setSalePaymentSelect("");
    setSaleProfessionalId(null);
    setSaleModalOpen(true);
  };

  const handleOpenSaleModalForEdit = (sale: AddedSaleItem, index: number) => {
    setSaleEditingIndex(index);
    setSelectedSaleProductId(sale.productId);
    setSaleQuantityInput(String(sale.quantity));
    setSalePriceInput(sale.price);
    setSalePaymentSelect(sale.paymentType);
    setSaleProfessionalId(sale.userId ?? null);
    setSaleModalOpen(true);
  };

  const handleDeleteAddedSale = async (sale: AddedSaleItem, index: number) => {
    if (!sale.saleId) {
      setAddedSales((previous) => previous.filter((_, currentIndex) => currentIndex !== index));
      return;
    }
    if (!accessToken) {
      setCreateAppointmentError("Sessão expirada. Faça login novamente.");
      return;
    }
    if (saleDeletingId) {
      return;
    }
    setSaleDeletingId(sale.saleId);
    try {
      const response = await fetchWithAuth(`${transactionsSellListEndpoint}${sale.saleId}/`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        let errorMessage = "Não foi possível excluir a venda.";
        try {
          const data = await response.json();
          if (data?.detail) {
            errorMessage = data.detail;
          }
        } catch {
          // noop
        }
        throw new Error(errorMessage);
      }

      setAddedSales((previous) => previous.filter((_, currentIndex) => currentIndex !== index));
    } catch (err) {
      setCreateAppointmentError(err instanceof Error ? err.message : "Erro inesperado ao excluir a venda.");
    } finally {
      setSaleDeletingId(null);
    }
  };

  const handleCloseSaleModal = () => {
    setSaleModalOpen(false);
    setSaleProfessionalId(null);
    setSaleEditingIndex(null);
  };

  const handleSelectSaleProduct = (productId: number) => {
    setSelectedSaleProductId(productId);
    const product = saleProductsList.find((item) => item.id === productId);
    if (product) {
      setSalePriceInput(product.price_to_sell ?? "");
    }
  };

  const handleAddSaleProduct = async () => {
    if (!accessToken) {
      setCreateAppointmentError("Sessão expirada. Faça login novamente.");
      return;
    }
    if (!selectedSaleProductId) {
      setCreateAppointmentError("Selecione um produto para vender.");
      return;
    }
    if (!salePaymentSelect) {
      setCreateAppointmentError("Informe a forma de pagamento da venda.");
      return;
    }
    const quantityValue = Number(saleQuantityInput);
    if (Number.isNaN(quantityValue) || quantityValue <= 0) {
      setCreateAppointmentError("Informe uma quantidade válida para a venda.");
      return;
    }
    const priceValue = parseCurrencyInput(salePriceInput);
    if (priceValue <= 0) {
      setCreateAppointmentError("Informe um preço válido para a venda.");
      return;
    }
    setIsAddingSaleProduct(true);
    try {
      const pickedProduct = saleProductsList.find((item) => item.id === selectedSaleProductId);
      const fallbackName = saleEditingIndex !== null ? addedSales[saleEditingIndex]?.productName : null;
      const nextItem: AddedSaleItem = {
        saleId: saleEditingIndex !== null ? addedSales[saleEditingIndex]?.saleId : undefined,
        productId: selectedSaleProductId,
        productName: pickedProduct?.name ?? fallbackName ?? `Produto #${selectedSaleProductId}`,
        price: priceValue.toFixed(2),
        quantity: quantityValue,
        paymentType: salePaymentSelect,
        userId: saleProfessionalId,
      };
      setAddedSales((previous) => {
        if (saleEditingIndex === null) {
          return [...previous, nextItem];
        }
        const updated = [...previous];
        updated[saleEditingIndex] = nextItem;
        return updated;
      });
      setSaleModalOpen(false);
      setSaleEditingIndex(null);
      setSaleProfessionalId(null);
      setSelectedSaleProductId(null);
      setSaleQuantityInput("1");
      setSalePriceInput("");
      setSalePaymentSelect("");
      setCreateAppointmentError(null);
    } finally {
      setIsAddingSaleProduct(false);
    }
  };

  const handleSubmitAppointment = async () => {
    setCreateAppointmentError(null);
    if (!accessToken) {
      setCreateAppointmentError("Sessão expirada. Faça login novamente.");
      return;
    }
    if (selectedAppointmentServices.length === 0) {
      setCreateAppointmentError("Escolha pelo menos um serviço.");
      return;
    }
    if (!selectedPaymentType) {
      setCreateAppointmentError("Selecione a forma de pagamento.");
      return;
    }
    const totalPriceValue = appointmentPriceValue;
    const dateTimeIso = buildDateTimeISOString(appointmentDateInput, appointmentTimeInput);
    if (!dateTimeIso) {
      setCreateAppointmentError("Informe uma data e hora válidas.");
      return;
    }
    if (isDateTimeWithinDayRestriction(appointmentDateInput, appointmentTimeInput)) {
      setCreateAppointmentError("O horário selecionado está dentro da restrição deste dia.");
      return;
    }
    if (filledAppointmentProfessionals.length === 0) {
      setCreateAppointmentError("Selecione pelo menos um profissional.");
      return;
    }
    if (!hasMultipleProfessionals) {
      if (totalPriceValue <= 0) {
        setCreateAppointmentError("Informe um preço válido.");
        return;
      }
    } else {
      for (const service of selectedAppointmentServices) {
        const assignment = serviceAssignments[service.id];
        if (!assignment?.professionalSlotId) {
          setCreateAppointmentError("Defina o profissional responsável por cada serviço.");
          return;
        }
        const slot = appointmentProfessionals.find((item) => item.id === assignment.professionalSlotId);
        if (!slot?.professional) {
          setCreateAppointmentError("Selecione profissionais válidos para os serviços.");
          return;
        }
        const priceValue = parseCurrencyInput(assignment.price);
        if (priceValue <= 0) {
          setCreateAppointmentError("Informe o preço pago para cada serviço.");
          return;
        }
      }
    }

    setIsSavingAppointment(true);
    try {
      const basePayload = {
        date_time: dateTimeIso,
        client: selectedClient?.id ?? null,
        discount: normalizedDiscount,
        payment_type: normalizeAppointmentPaymentTypeForApi(selectedPaymentType),
        status: selectedAppointmentStatus,
        observations: appointmentObservations || null,
      };

      const shouldIncludeSells =
        !isEditingExistingAppointment ||
        JSON.stringify(buildSalesFingerprint(addedSales)) !==
          JSON.stringify(buildSalesFingerprint(originalSalesSnapshotRef.current));

      const sellsPayload =
        shouldIncludeSells && addedSales.length > 0
          ? {
              sells: addedSales.map((sale) => ({
                ...(sale.saleId ? { id: sale.saleId } : {}),
                product: sale.productId,
                quantity: sale.quantity,
                price: sale.price,
                transaction_payment: normalizeAppointmentPaymentTypeForApi(sale.paymentType),
                ...(sale.userId ? { user: sale.userId } : {}),
              })),
            }
          : {};

      let payload: Record<string, unknown> = { ...basePayload, ...sellsPayload };

      if (hasMultipleProfessionals) {
        payload = {
          ...basePayload,
          ...sellsPayload,
          professional_services: selectedAppointmentServices.map((service) => {
            const assignment = serviceAssignments[service.id];
            const slot = appointmentProfessionals.find((item) => item.id === assignment?.professionalSlotId);
            const professional = slot?.professional;
            if (!professional) {
              throw new Error("Selecione profissionais válidos para os serviços.");
            }
            return {
              professional: professional.id,
              service: service.id,
              price_paid: parseCurrencyInput(assignment?.price ?? "0").toFixed(2),
              tips: parseCurrencyInput(assignment?.tips ?? "0").toFixed(2),
            };
          }),
        };
      } else {
        const professional = filledAppointmentProfessionals[0]?.professional;
        payload = {
          ...basePayload,
          ...sellsPayload,
          professional: professional?.id ?? 0,
          services: selectedAppointmentServices.map((service) => service.id),
          price_paid: appointmentPriceValue.toFixed(2),
          tips: appointmentTipsValue.toFixed(2),
        };
      }

      if (!isEditingExistingAppointment) {
        payload = {
          ...payload,
          appointment_origin: "presencial",
        };
      }

      const endpoint = isEditingExistingAppointment
        ? `${appointmentsEndpointBase}${appointmentId}/`
        : appointmentsEndpointBase;

      const response = await fetchWithAuth(endpoint, {
        method: isEditingExistingAppointment ? "PATCH" : "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = isEditingExistingAppointment
          ? "Não foi possível atualizar o agendamento."
          : "Não foi possível criar o agendamento.";
        try {
          const errorData = await response.json();
          if (errorData?.detail) {
            errorMessage = errorData.detail;
          }
        } catch {
          // noop
        }
        throw new Error(errorMessage);
      }

      const savedAppointment = (await response.json().catch(() => null)) as AppointmentItem | null;
      onSuccess(savedAppointment?.id ?? appointmentId ?? undefined);
    } catch (err) {
      setCreateAppointmentError(
        err instanceof Error
          ? err.message
          : isEditingExistingAppointment
            ? "Erro inesperado ao atualizar o agendamento."
            : "Erro inesperado ao criar o agendamento.",
      );
    } finally {
      setIsSavingAppointment(false);
    }
  };

  return {
    isEditingExistingAppointment,
    loadingExistingAppointment,
    loadingExistingAppointmentError,
    createAppointmentError,
    isSavingAppointment,
    selectedAppointmentStatus,
    setSelectedAppointmentStatus,
    selectedClient,
    appointmentProfessionals,
    selectedAppointmentServices,
    serviceAssignments,
    selectedPaymentType,
    priceInput,
    discountInput,
    tipsInput,
    appointmentObservations,
    appointmentDateInput,
    appointmentTimeInput,
    dayRestriction,
    showClientPickerModal,
    clientSearchInput,
    clientPickerResults,
    clientPickerLoading,
    clientPickerError,
    showClientRegistrationModal,
    clientRegistrationForm,
    clientRegistrationSubmitting,
    clientRegistrationError,
    showClientEmailSuggestions,
    showServicesPickerModal,
    servicesPickerSearchInput,
    servicesPickerResults,
    servicesPickerLoading,
    servicesPickerError,
    servicesPickerTempSelection,
    showProfessionalPickerModal,
    professionalSearchInput,
    professionalPickerResults,
    professionalPickerLoading,
    professionalPickerError,
    currentProfessionalPickerSlot,
    showPaymentTypeModal,
    saleModalOpen,
    saleProductsList,
    saleProductsLoading,
    saleProductsError,
    saleProductsSearchInput,
    saleProfessionalsList,
    saleProfessionalId,
    selectedSaleProductId,
    saleQuantityInput,
    salePriceInput,
    salePaymentSelect,
    isAddingSaleProduct,
    addedSales,
    saleDeletingId,
    filledAppointmentProfessionals,
    hasMultipleProfessionals,
    normalizedDiscount,
    servicesDiscountAmount,
    appointmentTipsTotal,
    appointmentGrandTotal,
    addedSalesTotal,
    servicesGrossTotal,
    handleAppointmentTimeChange,
    setAppointmentDateInput,
    setAppointmentObservations,
    handleClientPickerSearchSubmit,
    setClientSearchInput,
    handleSelectClient,
    handleClearSelectedClient,
    handleOpenClientRegistrationModal,
    setShowClientRegistrationModal,
    handleClientRegistrationInputChange,
    handleSelectClientEmailSuggestion,
    handleSubmitClientRegistration,
    setShowClientPickerModal,
    handleServicePickerSearchSubmit,
    setServicesPickerSearchInput,
    handleOpenServicesPickerModal,
    handleCancelServicesPicker,
    handleToggleServiceInModal,
    handleConfirmServicesPicker,
    handleRemoveAppointmentService,
    handleAddProfessionalSlot,
    handleRemoveProfessionalSlot,
    handleOpenProfessionalPicker,
    handleCloseProfessionalPicker,
    handleProfessionalPickerSearchSubmit,
    setProfessionalSearchInput,
    handleSelectProfessionalForAppointment,
    handleClearProfessionalSelection,
    handleServiceAssignmentProfessionalChange,
    handleServiceAssignmentPriceChange,
    handleTipsInputChange,
    handleServiceAssignmentTipsChange,
    setShowPaymentTypeModal,
    handleSelectPaymentOption,
    handlePriceInputChange,
    handleDiscountInputChange,
    handleResetPriceFromServices,
    handleOpenSaleModal,
    handleOpenSaleModalForEdit,
    handleDeleteAddedSale,
    handleCloseSaleModal,
    setSaleProductsSearchInput,
    setSaleProductsSearchTerm,
    handleSelectSaleProduct,
    setSaleProfessionalId,
    setSalePaymentSelect,
    setSaleQuantityInput,
    setSalePriceInput,
    handleAddSaleProduct,
    handleSubmitAppointment,
    resetAppointmentForm,
  };
}
