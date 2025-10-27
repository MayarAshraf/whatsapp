import { inject, Injectable } from "@angular/core";
import { MessageService, ToastMessageOptions } from "primeng/api";

@Injectable({ providedIn: "root" })
export class AlertService {
  #message = inject(MessageService);

  setMessage(data: ToastMessageOptions) {
    const message: ToastMessageOptions = {
      key: data.key,
      severity: data.severity || "info",
      summary: data.summary || "",
      detail: data.detail || "",
      icon: data.icon,
      sticky: data.sticky ?? false,
      life: data.life ?? 8000,
      data: data.data,
    };

    const { detail, summary } = message;

    const hasContent =
      (detail && detail.trim().length > 0) || (summary && summary.trim().length > 0);

    if (!hasContent) return;

    this.#message.add(message);
  }
}
