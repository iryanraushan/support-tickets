import { Calendar, User, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface TicketMetaProps {
  priority: number;
  assignees?: Array<{ name: string; email: string }>;
  createdAt: string;
}

export function TicketMeta({ priority, assignees, createdAt }: TicketMetaProps) {
  return (
    <div className="flex gap-6 items-center">
      <div className="flex gap-2 items-center">
        <AlertCircle className={`inline h-4 w-4 ${
          priority === 5 ? 'text-red-500' :
          priority === 4 ? 'text-orange-500' :
          priority === 3 ? 'text-yellow-500' :
          priority === 2 ? 'text-blue-500' :
          'text-gray-500'
        }`} />
        <p className="text-muted-foreground">
          Priority {priority}
        </p>
      </div>
      {assignees && assignees.length > 0 && (
        <div className="flex gap-2 items-center">
          <User className="inline h-4 w-4" />
          <p className="text-muted-foreground">
            {assignees.length === 1 
              ? assignees[0].name 
              : `${assignees.length} assignees`
            }
          </p>
        </div>
      )}
      <div className="flex gap-2 items-center">
        <Calendar className="inline h-4 w-4" />
        <p className="text-muted-foreground">
          {format(new Date(createdAt), "MMM do, yyyy")}
        </p>
      </div>
    </div>
  );
}