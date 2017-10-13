import {Address, AuthedRequest, BaseResponse, CompanyAttributes, VingerFormAttributes} from '../shared';
import {documents} from "./document_handlers";

export declare namespace vinger {

  import EntitySignStatus = documents.EntitySignStatus;

  interface LegalEntityAttributes {
    idNumber: string
    name: string
    email: string
    address: Address
    contactName?: string // for companies
    contactIdNumber?: string // for companies
  }

  // for returning data from system
  interface Owner extends LegalEntityAttributes {
    numberOfShares: number
  }

  interface BeneficialOwner extends Owner {
    taxCountry: string
    americanTaxId?: string
  }

  interface BoardMemberAttributes extends LegalEntityAttributes {
    role: string
  }

  interface StartCompanyVingerForm extends VingerFormAttributes {
    beneficialOwners: Array<BeneficialOwner>
  }

  interface StartCompanyRequest extends CompanyAttributes {
    owners: Array<Owner>
    board: Array<BoardMemberAttributes>
    vingerForm: StartCompanyVingerForm
  }

  interface StartCompanyResponse extends BaseResponse {
    signJobAids: string[]
  }

  interface GetCompaniesInProgressRequest {}

  interface GetVingerCompanyRequest extends AuthedRequest {
    companyId: number
  }

  interface VingerCompanyResponseForm extends vinger.StartCompanyVingerForm {
    forwardEmail: string

  }

  interface GetVingerCompanyResponse extends vinger.StartCompanyRequest, BaseResponse {
    vingerForm: VingerCompanyResponseForm
  }

  interface GetVingerFormBasicStatusRequest {
    stiftelsesDokAid: string
  }

  interface GetVingerFormBasicStatusResponse {
    remainingSignatures: boolean
    autoBanking: boolean
  }

  interface GetVingerSignStatusRequest extends AuthedRequest {
    companyId: number
  }

  interface GetVingerSignStatusResponse extends BaseResponse {
    owners: EntitySignStatus[]
    board: EntitySignStatus[]
  }

  interface GetVingerBankSignUrlRequest extends AuthedRequest{
    companyId: number
  }

  interface GetVingerBankSignUrlResponse extends BaseResponse{
    signUrl: string
  }

}