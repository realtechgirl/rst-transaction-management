export const TRANSACTION_TYPES = ["Residential Purchase","Residential Listing","Residential New Construction","Vacant Land Purchase","Vacant Land Listing","Residential Lease","Rental Listing"] as const;
export const SIDES = ["Buyer","Seller","Landlord","Tenant","Both"] as const;
export const STATUSES = ["Intake","Active","Pending","Clear to Close","Closed","Cancelled"] as const;

export type TransactionType = typeof TRANSACTION_TYPES[number];
export type Side = typeof SIDES[number];
export type Status = typeof STATUSES[number];
export type PartyRole = "Client"|"Agent"|"Cooperating Agent"|"Title / Escrow"|"Lender";

export interface Party { id:string; role:PartyRole; name:string; company:string; email:string; phone:string; }
export interface Milestone { id:string; label:string; dueDate:string; status:"Not started"|"Complete"; }
export interface Transaction {
  id:string; address:string; city:string; state:string; postalCode:string; county:string;
  transactionType:TransactionType; side:Side; status:Status; effectiveDate:string; closingDate:string;
  purchasePrice:string; mlsNumber:string; financingType:string; tcFee:string; notes:string;
  parties:Party[]; milestones:Milestone[]; createdAt:string; updatedAt:string;
}

export const EMPTY_TRANSACTION: Omit<Transaction,"id"|"createdAt"|"updatedAt"> = {
  address:"",city:"",state:"FL",postalCode:"",county:"",transactionType:"Residential Purchase",side:"Buyer",status:"Intake",
  effectiveDate:"",closingDate:"",purchasePrice:"",mlsNumber:"",financingType:"",tcFee:"",notes:"",parties:[],milestones:[]
};
