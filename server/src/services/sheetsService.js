import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

class SheetsService {
  constructor() {
    this.doc = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
      await this.doc.loadInfo();
      this.initialized = true;
      console.log('✅ Google Sheets connected');
    } catch (error) {
      console.error('❌ Google Sheets connection error:', error);
      throw error;
    }
  }

  async getOrCreateSheet(title) {
    await this.initialize();

    let sheet = this.doc.sheetsByTitle[title];

    if (!sheet) {
      const headerValues = title === 'Utilisateurs'
        ? ['ID', 'Prénom', 'Nom', 'Email']
        : ['Date', 'Nom', 'Prénom', 'ID Utilisateur', 'Heure Arrivée', 'Heure Sortie', 'Statut'];

      sheet = await this.doc.addSheet({
        title: title,
        headerValues,
      });
    }

    return sheet;
  }

  async addOrUpdateAttendance(userId, userData, type) {
    try {
      const today = new Date().toLocaleDateString('fr-FR');
      const sheet = await this.getOrCreateSheet('Pointages');
      
      await sheet.loadHeaderRow();
      const rows = await sheet.getRows();
      
      // Chercher la ligne de l'utilisateur pour aujourd'hui
      let userRow = rows.find(row => 
        row.get('ID Utilisateur') === String(userId) && 
        row.get('Date') === today
      );

      const now = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

      if (!userRow && type === 'arrival') {
        // Créer une nouvelle ligne pour l'arrivée
        await sheet.addRow({
          'Date': today,
          'Nom': userData.lastName,
          'Prénom': userData.firstName,
          'ID Utilisateur': userId,
          'Heure Arrivée': now,
          'Heure Sortie': '-',
          'Statut': 'Présent'
        });
      } else if (userRow && type === 'departure') {
        // Mettre à jour la sortie
        userRow.set('Heure Sortie', now);
        await userRow.save();
      }

      return {
        success: true,
        type: type === 'arrival' ? 'Arrivée' : 'Sortie',
        time: now,
        userData
      };
    } catch (error) {
      console.error('Error adding/updating attendance:', error);
      throw error;
    }
  }

  async getUserAttendanceToday(userId) {
    try {
      const today = new Date().toLocaleDateString('fr-FR');
      const sheet = await this.getOrCreateSheet('Pointages');
      
      await sheet.loadHeaderRow();
      const rows = await sheet.getRows();
      
      const userRecord = rows.find(row => 
        row.get('ID Utilisateur') === String(userId) && 
        row.get('Date') === today
      );

      if (!userRecord) {
        return null;
      }

      return {
        date: userRecord.get('Date'),
        firstName: userRecord.get('Prénom'),
        lastName: userRecord.get('Nom'),
        arrivalTime: userRecord.get('Heure Arrivée'),
        departureTime: userRecord.get('Heure Sortie'),
        status: userRecord.get('Statut')
      };
    } catch (error) {
      console.error('Error getting attendance:', error);
      throw error;
    }
  }

  async getAllAttendanceToday() {
    try {
      const today = new Date().toLocaleDateString('fr-FR');
      const sheet = await this.getOrCreateSheet('Pointages');
      
      await sheet.loadHeaderRow();
      const rows = await sheet.getRows();
      
      return rows
        .filter(row => row.get('Date') === today)
        .map(row => ({
          userId: row.get('ID Utilisateur'),
          firstName: row.get('Prénom'),
          lastName: row.get('Nom'),
          arrivalTime: row.get('Heure Arrivée'),
          departureTime: row.get('Heure Sortie'),
          status: row.get('Statut')
        }));
    } catch (error) {
      console.error('Error getting all attendance:', error);
      throw error;
    }
  }

  async getUserData(userId) {
    try {
      const sheet = await this.getOrCreateSheet('Utilisateurs');
      await sheet.loadHeaderRow();
      const rows = await sheet.getRows();

      const user = rows.find(row => {
        const idValue = row.get('Id') || row.get('ID') || row.Id || row.ID || row['Id'] || row['ID'];
        return String(idValue) === String(userId);
      });

      if (!user) {
        return null;
      }

      return {
        id: user.get('Id') || user.get('ID') || user.Id || user.ID || user['Id'] || user['ID'],
        firstName: user.get('Prénom') || user['Prénom'] || user.Prénom,
        lastName: user.get('Nom') || user['Nom'] || user.Nom,
        email: user.get('Email') || user['Email'] || user.Email || ''
      };
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  async getAllUsers() {
    try {
      const sheet = await this.getOrCreateSheet('Utilisateurs');
      await sheet.loadHeaderRow();
      const rows = await sheet.getRows();
      
      return rows.map(row => ({
        id: row.get('Id') || row.get('ID') || row.Id || row.ID || row['Id'] || row['ID'],
        firstName: row.get('Prénom') || row['Prénom'] || row.Prénom,
        lastName: row.get('Nom') || row['Nom'] || row.Nom,
        email: row.get('Email') || row['Email'] || row.Email || ''
      }));
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async addUser(userData) {
    try {
      const sheet = await this.getOrCreateSheet('Utilisateurs');
      await sheet.addRow({
        'Id': userData.id,
        'Prénom': userData.firstName,
        'Nom': userData.lastName,
        'Email': userData.email || ''
      });
      return { success: true };
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  }
}

export default new SheetsService();
