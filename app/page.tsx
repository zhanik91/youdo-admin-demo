// app/page.tsx
import PageTitle from "@/components/PageTitle";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const stats = [
    { title: "Выручка", value: "640 000 KZT" },
    { title: "Оплачено", value: "3" },
    { title: "В ожидании", value: "1" },
    { title: "Возвраты", value: "1" },
  ];

  const lastOrders = [
    { id: 1012, client: "Arai LTD", status: "Paid", amount: "125 000 KZT", date: "2025-09-20" },
    { id: 1013, client: "Rauan IE", status: "Pending", amount: "65 000 KZT", date: "2025-09-21" },
    { id: 1014, client: "SmartFix", status: "Refunded", amount: "28 000 KZT", date: "2025-09-22" },
  ];

  return (
    <>
      <PageTitle title="Панель" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardBody>
              <div className="text-slate-400 text-sm">{s.title}</div>
              <div className="text-2xl font-semibold mt-2">{s.value}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Доход по месяцам (мок)</div>
              <Button size="sm" variant="ghost">Экспорт CSV</Button>
            </div>
            <div className="mt-6 h-48 rounded bg-slate-900/60 grid place-items-center text-slate-400">
              (график можно подключить позже)
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="text-lg font-semibold mb-4">Быстрые действия</div>
            <div className="space-y-3">
              <Button className="w-full">Создать задачу</Button>
              <Button className="w-full" variant="secondary">Импорт CSV</Button>
              <Button className="w-full" variant="ghost">Экспорт CSV</Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardBody>
          <div className="text-lg font-semibold mb-4">Последние заказы</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-400">
                <tr>
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Клиент</th>
                  <th className="py-2 pr-4">Статус</th>
                  <th className="py-2 pr-4">Сумма</th>
                  <th className="py-2 pr-4">Дата</th>
                </tr>
              </thead>
              <tbody>
                {lastOrders.map((o) => (
                  <tr key={o.id} className="border-t border-slate-800">
                    <td className="py-3 pr-4">{o.id}</td>
                    <td className="py-3 pr-4">{o.client}</td>
                    <td className="py-3 pr-4">
                      <Badge
                        color={
                          o.status === "Paid" ? "green" : o.status === "Pending" ? "yellow" : "red"
                        }
                      >
                        {o.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">{o.amount}</td>
                    <td className="py-3 pr-4">{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
