import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ClientService } from './client.service';
import { Client, ClientPage } from '../types/client.model';
import { environment } from '../../environments/environment';

describe('ClientService', () => {
  let service: ClientService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/clients`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClientService]
    });
    service = TestBed.inject(ClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure that there are no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getClients', () => {
    it('should return a paginated list of clients', () => {
      const mockResponse: ClientPage = {
        content: [
          {
            id: 1,
            nome: 'Cliente Teste 1',
            email: 'cliente1@teste.com',
            telefone: '(11) 99999-9999',
            endereco: 'Rua Teste, 123'
          },
          {
            id: 2,
            nome: 'Cliente Teste 2',
            email: 'cliente2@teste.com',
            telefone: '(11) 88888-8888',
            endereco: 'Av. Teste, 456'
          }
        ],
        totalElements: 2,
        totalPages: 1,
        size: 10,
        number: 0
      };

      service.getClients().subscribe(clients => {
        expect(clients).toEqual(mockResponse);
        expect(clients.content.length).toBe(2);
        expect(clients.totalElements).toBe(2);
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle pagination parameters', () => {
      const page = 1;
      const size = 5;
      const mockResponse: ClientPage = { content: [], totalElements: 0, totalPages: 0, size, number: page };

      service.getClients(page, size).subscribe();

      const req = httpMock.expectOne(`${apiUrl}?page=1&size=5`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getClientById', () => {
    it('should return a client by id', () => {
      const clientId = 1;
      const mockClient: Client = {
        id: clientId,
        nome: 'Cliente Teste',
        email: 'cliente@teste.com',
        telefone: '(11) 99999-9999',
        endereco: 'Rua Teste, 123'
      };

      service.getClientById(clientId).subscribe(client => {
        expect(client).toEqual(mockClient);
      });

      const req = httpMock.expectOne(`${apiUrl}/${clientId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockClient);
    });

    it('should handle errors when client is not found', () => {
      const clientId = 999;
      const errorResponse = { status: 404, statusText: 'Not Found' };

      service.getClientById(clientId).subscribe({
        next: () => fail('Should have failed with 404 error'),
        error: (error) => {
          expect(error.message).toContain('Error Code: 404');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${clientId}`);
      req.flush('Not found', errorResponse);
    });
  });

  describe('createClient', () => {
    it('should create a new client', () => {
      const newClient: Client = {
        nome: 'Novo Cliente',
        email: 'novo@teste.com',
        telefone: '(11) 99999-9999',
        endereco: 'Rua Nova, 123'
      };

      const createdClient: Client = {
        id: 1,
        ...newClient
      };

      service.createClient(newClient).subscribe(client => {
        expect(client).toEqual(createdClient);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newClient);
      req.flush(createdClient);
    });
  });

  describe('updateClient', () => {
    it('should update an existing client', () => {
      const clientId = 1;
      const updatedClient: Client = {
        id: clientId,
        nome: 'Cliente Atualizado',
        email: 'atualizado@teste.com',
        telefone: '(11) 88888-8888',
        endereco: 'Rua Atualizada, 456'
      };

      service.updateClient(clientId, updatedClient).subscribe(client => {
        expect(client).toEqual(updatedClient);
      });

      const req = httpMock.expectOne(`${apiUrl}/${clientId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedClient);
      req.flush(updatedClient);
    });
  });

  describe('deleteClient', () => {
    it('should delete a client', () => {
      const clientId = 1;
      const mockResponse = 'Cliente deletado com sucesso!';

      service.deleteClient(clientId).subscribe(response => {
        expect(response).toBe(mockResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${clientId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', () => {
      const errorEvent = new ErrorEvent('Network error', { message: 'Connection refused' });

      service.getClients().subscribe({
        next: () => fail('Should have failed with network error'),
        error: (error) => {
          expect(error.message).toContain('Connection refused');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}?page=0&size=10`);
      req.error(errorEvent);
    });

    it('should handle server errors', () => {
      const errorResponse = { status: 500, statusText: 'Internal Server Error' };

      service.createClient({} as Client).subscribe({
        next: () => fail('Should have failed with server error'),
        error: (error) => {
          expect(error.message).toContain('Error Code: 500');
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Server error', errorResponse);
    });
  });
});

