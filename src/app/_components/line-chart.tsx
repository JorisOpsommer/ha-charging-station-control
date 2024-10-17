"use client";

import { type inferProcedureOutput } from "@trpc/server";
import {
  CategoryScale,
  Chart as ChartJS,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { STATION_CHARGE_STATE } from "~/models/station-charge-state-enum";
import { type AppRouter } from "~/server/api/root";
import dayjs from "~/utils/dayjs";
export const LineChart = ({
  data,
}: {
  data?: inferProcedureOutput<
    AppRouter["homeAssistantData"]["dataIncludeChargingStatesIncludeInstructionStates"]
  >;
}) => {
  ChartJS.register(
    LineElement,
    PointElement,
    LinearScale,
    Title,
    CategoryScale,
    Tooltip,
  );

  const chartData = {
    labels: data?.map(
      (x) => `${dayjs(x.createdAt).utc().local().format("DD-MMM HH:mm")}h`,
    ),
    datasets: [
      {
        label: "Inverter",
        data: data?.map((x) => x.inverterOutputInWatt),
        borderColor: "rgb(96, 234, 89)",
        backgroundColor: "rgba(96, 234, 89,0.5)",
        yAxisID: "watt",
      },
      {
        label: "Consumption",
        data: data?.map((x) => x.powerConsumptionInWatt),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        yAxisID: "watt",
      },
      {
        label: "Charging state",
        data: data?.map((x) => {
          switch (x?.chargingStateChange?.state) {
            case STATION_CHARGE_STATE.PAUSED:
              return 0;
            case STATION_CHARGE_STATE.SLOW:
              return 1;
            case STATION_CHARGE_STATE.TURBO:
              return 2;
            default:
              // TODO
              // If no state is retrieved from backend then we don't want to display it.
              return 0;
          }
        }),
        borderColor: "rgb(136, 72, 197)",
        backgroundColor: "rgba(113, 42, 159, 0.5)",
        yAxisID: "state",
      },
    ],
  };

  const options: any = {
    responsive: true,
    scales: {
      watt: {
        type: "linear",
        display: true,
        position: "left",
      },
      state: {
        type: "linear",
        display: true,
        position: "right",
        ticks: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Inverter & power consumption in Watt",
      },

      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (tooltipItem) => {
            if (tooltipItem.datasetIndex == 2) {
              switch (tooltipItem.raw) {
                case 0: //STATION_CHARGE_STATE.PAUSED:
                  return `${tooltipItem.dataset.label}: paused`;
                case 1: //STATION_CHARGE_STATE.SLOW:
                  return `${tooltipItem.dataset.label}: slow`;
                case 2: //STATION_CHARGE_STATE.TURBO:
                  return `${tooltipItem.dataset.label}: turbo`;
              }
            }
            let label: string = tooltipItem.dataset.label || "";
            if (label) {
              label += ": ";
            }
            label += tooltipItem.raw;
            return label;
          },
          title: (tooltipItems) => {
            return `${tooltipItems[0].label}`;
          },
        },
      },
    },
  };
  return (
    <div className="">
      {data && data?.length > 0 && <Line data={chartData} options={options} />}
    </div>
  );
};
