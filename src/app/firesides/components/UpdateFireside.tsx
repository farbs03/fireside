import { type Fireside } from "@prisma/client";
import { useState } from "react";
import {Button} from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import {
  Droplet,
  Package,
  AmbulanceIcon as FirstAid,
  Users,
} from "lucide-react";

type Props = {
  fireside: Fireside;
};

const UpdateFireside: React.FC<Props> = ({ fireside }) => {
  const [values, setValues] = useState(fireside);
  const updateFireside = api.fireside.update.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: Number(e.target.value) });
  };

  const handleSubmit = () => {
    updateFireside.mutate({firesideId: values.id, food: values.food, water: values.water, medical: values.medical, capacity: values.capacity});
  };

  return (
    <div className="p-4 border rounded-lg shadow-md w-full">
      <h2 className="font-semibold mb-2">Update Fireside <span className="font-normal">{fireside.displayName}</span></h2>
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <Droplet className="h-4 w-4 text-blue-500" />
          <Input
            type="number"
            name="water"
            value={values.water}
            onChange={handleChange}
            placeholder="Water"
          />
        </div>
        <div className="flex items-center gap-1">
          <Package className="h-4 w-4 text-orange-500" />
          <Input
            type="number"
            name="food"
            value={values.food}
            onChange={handleChange}
            placeholder="Food"
          />
        </div>
        <div className="flex items-center gap-1">
          <FirstAid className="h-4 w-4 text-red-500" />
          <Input
            type="number"
            name="medical"
            value={values.medical}
            onChange={handleChange}
            placeholder="Medical"
          />
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-purple-500" />
          <Input
            type="number"
            name="capacity"
            value={values.capacity}
            onChange={handleChange}
            placeholder="Capacity"
          />
        </div>
        <Button onClick={handleSubmit}>
          {"Confirm"}
        </Button>
        </div>
      </div>
  );
};

export default UpdateFireside;
