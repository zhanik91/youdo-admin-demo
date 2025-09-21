// app/catalog/page.tsx
import PageTitle from "@/components/PageTitle";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function CatalogPage() {
  const items = [
    { id: 1, title: "Ремонт стиральных машин", group: "Бытовая техника", risky: false },
    { id: 2, title: "Грузоперевозки", group: "Транспорт", risky: true },
    { id: 3, title: "Компьютерная помощь", group: "IT", risky: false },
  ];

  return (
    <>
      <PageTitle title="Каталог" />
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold">Услуги</div>
            <div className="space-x-2">
              <Button>Добавить</Button>
              <Button variant="secondary">Импорт</Button>
              <Button variant="ghost">Экспорт</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-400">
                <tr>
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Название</th>
                  <th className="py-2 pr-4">Группа</th>
                  <th className="py-2 pr-4">Риск</th>
                  <th className="py-2 pr-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-t border-slate-800">
                    <td className="py-3 pr-4">{i.id}</td>
                    <td className="py-3 pr-4">{i.title}</td>
                    <td className="py-3 pr-4">{i.group}</td>
                    <td className="py-3 pr-4">
                      {i.risky ? <Badge color="yellow">Рисковая</Badge> : <Badge>OK</Badge>}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="space-x-2">
                        <Button size="sm" variant="secondary">Редакт.</Button>
                        <Button size="sm" variant="ghost">Удалить</Button>
                      </div>
                    </td>
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
